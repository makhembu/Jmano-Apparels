

import { supabase } from '../supabaseClient';
import { supabasePublic } from '../supabasePublicClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { BlogPost, BlogCategory, AppSettings, NewsletterSubscriber, ContactSubmission, EmailTemplate, DbBlogPost, DbBlogCategory, DbAppSettings, DbNewsletterSubscriber, DbContactSubmission, DbEmailTemplate, BlogComment } from '../../types';

export class BlogService {
  async getAllPosts(): Promise<BlogPost[]> {
    log('SELECT', 'blog_posts');
    const { data, error } = await supabasePublic.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbBlogPost[]).map(Mappers.toBlogPost);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    log('SELECT', 'blog_posts', slug);
    const { data, error } = await supabasePublic.from('blog_posts').select('*').eq('slug', slug).single();
    if (error) return null;
    return Mappers.toBlogPost(data as DbBlogPost);
  }
  
  async getCategories(): Promise<BlogCategory[]> {
    log('SELECT', 'blog_categories');
    const { data, error } = await supabasePublic.from('blog_categories').select('*');
    if (error) throw error;
    return ((data || []) as DbBlogCategory[]).map(Mappers.toBlogCategory);
  }

  async createCategory(category: Partial<BlogCategory>): Promise<void> {
    log('INSERT', 'blog_categories', category);
    const { error } = await supabase.from('blog_categories').insert({
      name: category.name, slug: category.slug, description: category.description
    } as any);
    if (error) throw error;
  }

  async deleteCategory(id: string): Promise<void> {
    log('DELETE', 'blog_categories', id);
    const { error } = await supabase.from('blog_categories').delete().eq('id', id);
    if (error) throw error;
  }

  async createPost(post: Partial<BlogPost>): Promise<void> {
    log('INSERT', 'blog_posts', post.title);
    const dbPost = this.prepareDbBlogPost(post);
    const { error } = await supabase.from('blog_posts').insert(dbPost as any);
    if (error) throw error;
  }

  async updatePost(id: string, post: Partial<BlogPost>): Promise<void> {
    log('UPDATE', 'blog_posts', id);
    const dbPost = this.prepareDbBlogPost(post);
    const { error } = await supabase.from('blog_posts').update(dbPost as any).eq('id', id);
    if (error) throw error;
  }

  async deletePost(id: string): Promise<void> {
    log('DELETE', 'blog_posts', id);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  }

  async bulkUpdate(ids: string[], updates: Partial<BlogPost>): Promise<void> {
    log('BULK_UPDATE', 'blog_posts', { count: ids.length, updates });
    for (const id of ids) {
        await this.updatePost(id, updates);
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    log('BULK_DELETE', 'blog_posts', { count: ids.length });
    const { error } = await supabase.from('blog_posts').delete().in('id', ids);
    if (error) throw error;
  }

  async incrementViewCount(id: string): Promise<void> {
    log('RPC/UPDATE', 'blog_posts', `increment views for ${id}`);
    const { data } = await supabasePublic.from('blog_posts').select('view_count').eq('id', id).single();
    if (data) {
       await supabase.from('blog_posts').update({ view_count: ((data as any).view_count || 0) + 1 } as any).eq('id', id);
    }
  }

  async incrementBlogPostLike(postId: string) {
    log('RPC', 'blog_posts', 'increment_blog_like');
    const { data, error } = await (supabase.rpc as any)('increment_blog_like', { post_id_to_inc: postId });
    if (error) throw error;
    return data;
  }
  
  async getBlogComments(postId: string): Promise<BlogComment[]> {
    log('SELECT', 'blog_comments', `for post ${postId}`);
    const { data, error } = await supabase.from('blog_comments').select('*, user:users(name)').eq('post_id', postId).eq('is_approved', true).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(Mappers.toBlogComment);
  }
  
  async addBlogComment(postId: string, userId: string, comment: string): Promise<void> {
    log('INSERT', 'blog_comments', `for post ${postId}`);
    const { error } = await (supabase.from('blog_comments') as any).insert({ post_id: postId, user_id: userId, comment: comment });
    if (error) throw error;
  }

  private prepareDbBlogPost(post: Partial<BlogPost>) {
    return {
      title: post.title, summary: post.summary, content: post.content,
      slug: post.slug, status: post.status, featured_image: post.featuredImage,
      thumbnail: post.thumbnail, author: post.author, reading_time: post.readingTime,
      category_id: post.categoryId, seo_title: post.seoTitle, seo_description: post.seoDescription,
      canonical_url: post.canonicalUrl, is_noindex: post.isNoIndex, is_nofollow: post.isNoFollow,
      keywords: post.keywords, scheduled_for: post.scheduledFor || null, updated_at: new Date().toISOString(),
    };
  }
}

export class SettingsService {
  async get(): Promise<AppSettings | null> {
    log('FETCH', 'public_settings');
    try {
      const { data, error } = await supabasePublic.rpc('get_public_site_settings');
      if (error) throw error;
      if (data) return Mappers.toAppSettings(data as DbAppSettings);
      return null;
    } catch (e) {
      console.error("Fatal error in SettingsService.get()", e);
      return null;
    }
  }

  async getAdminSettings(): Promise<AppSettings | null> {
    log('SELECT', 'app_settings (ADMIN)');
    const { data, error } = await supabase.from('app_settings').select('*').single();
    if (error) return null;
    return Mappers.toAppSettings(data as DbAppSettings);
  }

  async getPublicPaymentSettings(): Promise<{ paypalClientId: string; paypalMode: string; paymentGatewayEnabled: boolean; currency: string } | null> {
    log('RPC', 'get_public_payment_settings');
    const { data, error } = await supabasePublic.rpc('get_public_payment_settings');
    if (error) return null;
    const settings = data as any;
    return {
      paypalClientId: settings.paypal_client_id, paypalMode: settings.paypal_mode,
      paymentGatewayEnabled: settings.payment_gateway_enabled, currency: settings.currency
    };
  }

  async update(id: number, settings: Partial<AppSettings>): Promise<void> {
    log('UPDATE', 'app_settings', { id });
    const dbSettings: any = {
      slogan: settings.slogan, secondary_slogan: settings.secondarySlogan, logo_image: settings.logoImage,
      mission: settings.mission, vision: settings.vision, core_values: settings.coreValues,
      founder_name: settings.founderName, founder_bio: settings.founderBio, founder_image: settings.founderImage, founder_quote: settings.founderQuote,
      contact_email: settings.contactEmail, contact_phone: settings.contactPhone, contact_address: settings.contactAddress,
      business_hours: settings.businessHours, social_links: settings.socialLinks,
      maintenance_mode: settings.maintenanceMode, maintenance_message: settings.maintenanceMessage,
      hero_banner_text: settings.heroBannerText, hero_banner_image: settings.heroBannerImage,
      announcement_text: settings.announcementText, is_announcement_enabled: settings.isAnnouncementEnabled,
      privacy_policy: settings.privacyPolicy, terms_conditions: settings.termsConditions, return_policy: settings.returnPolicy,
      shipping_policy: settings.shippingPolicy, tax_rate: settings.taxRate, free_shipping_threshold: settings.freeShippingThreshold,
      require_login_for_checkout: settings.requireLoginForCheckout, featured_categories: settings.featuredCategories,
      gemini_api_key: settings.geminiApiKey,
      
      // Email Notifications
      enable_email_notifications: settings.enableEmailNotifications,
      enable_email_welcome: settings.enableEmailWelcome,
      enable_email_new_order: settings.enableEmailNewOrder,
      enable_email_order_processing: settings.enableEmailOrderProcessing,
      enable_email_order_shipped: settings.enableEmailOrderShipped,
      enable_email_order_cancelled: settings.enableEmailOrderCancelled,
      enable_email_order_refunded: settings.enableEmailOrderRefunded,
      enable_email_return_requested: settings.enableEmailReturnRequested,
      enable_email_return_approved: settings.enableEmailReturnApproved,
      enable_email_return_rejected: settings.enableEmailReturnRejected,
      enable_email_contact_autoreply: settings.enableEmailContactAutoreply,
      enable_email_newsletter_welcome: settings.enableEmailNewsletterWelcome,
      enable_email_admin_new_order: settings.enableEmailAdminNewOrder,
      enable_email_contact_admin: settings.enableEmailContactAdmin,
      enable_email_admin_return_alert: settings.enableEmailAdminReturnAlert,

      enable_newsletter_signup: settings.enableNewsletterSignup,
      enable_contact_form: settings.enableContactForm, enable_reviews: settings.enableReviews,
      enable_featured_products: settings.enableFeaturedProducts, enable_commitment_section: settings.enableCommitmentSection,
      enable_categories_section: settings.enableCategoriesSection, enable_community_section: settings.enableCommunitySection,
      enable_journal_section: settings.enableJournalSection, enable_social_section: settings.enableSocialSection,
      seo_title: settings.seoTitle, seo_description: settings.seoDescription, default_og_image: settings.defaultOgImage,
      google_analytics_id: settings.googleAnalyticsId, custom_head_scripts: settings.customHeadScripts,
      shop_seo_title: settings.shopSeoTitle, shop_seo_description: settings.shopSeoDescription,
      blog_seo_title: settings.blogSeoTitle, blog_seo_description: settings.blogSeoDescription,
      about_seo_title: settings.aboutSeoTitle, about_seo_description: settings.aboutSeoDescription,
      paypal_client_id: settings.paypalClientId, paypal_secret_key: settings.paypalSecretKey,
      paypal_mode: settings.paypalMode, payment_gateway_enabled: settings.paymentGatewayEnabled,
      resend_api_key: settings.resendApiKey, resend_from_email: settings.resendFromEmail,
      seo_content_title: settings.seoContentTitle, seo_content_intro: settings.seoContentIntro,
      seo_content_col1_title: settings.seoContentCol1Title, seo_content_col1_body: settings.seoContentCol1Body,
      seo_content_col2_title: settings.seoContentCol2Title, seo_content_col2_body: settings.seoContentCol2Body,
      social_section_title: settings.socialSectionTitle, social_section_body: settings.socialSectionBody,
      
      // Business Info
      company_name: settings.companyName,
      registration_number: settings.registrationNumber,
      vat_number: settings.vatNumber,
      payment_instructions: settings.paymentInstructions,
      payment_terms: settings.paymentTerms
    };
    Object.keys(dbSettings).forEach(key => dbSettings[key] === undefined && delete dbSettings[key]);
    
    const { error } = await supabase.from('app_settings').update(dbSettings as any).eq('id', id);
    if (error) throw error;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    log('SELECT', 'email_templates');
    const { data, error } = await supabase.from('email_templates').select('*').order('name');
    if (error) throw error;
    return ((data || []) as DbEmailTemplate[]).map(Mappers.toEmailTemplate);
  }

  async updateEmailTemplate(id: string, template: Partial<EmailTemplate>): Promise<void> {
    log('UPDATE', 'email_templates', id);
    const payload: any = {};
    if (template.subject) payload.subject = template.subject;
    if (template.bodyHtml) payload.body_html = template.bodyHtml;
    const { error } = await supabase.from('email_templates').update(payload as any).eq('id', id);
    if (error) throw error;
  }
  
  async checkEmailHealth(testEmail: string, candidateKey?: string, candidateFrom?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const payload: any = { to: testEmail, subject: 'Jambo Apparels - Resend Integration Test', htmlBody: '<p>This is a test email.</p>', testMode: true };
      if (candidateKey) payload.providerConfig = { apiKey: candidateKey, from: candidateFrom };
      const response = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.error || 'Provider rejected credentials' };
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Unknown error' };
    }
  }

  async sendTestTemplate(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, htmlBody, testMode: false }) });
      const data = await response.json();
      if (!response.ok || data?.success === false) throw new Error(data.error || 'Server error');
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Unknown error' };
    }
  }

  async sendTransactionalEmail(templateName: string, recipient: string, variables: Record<string, string>): Promise<void> {
    try {
        log('SEND_EMAIL', templateName, recipient);
        const [templates, settings] = await Promise.all([this.getEmailTemplates(), this.get()]);
        const template = templates.find(t => t.name === templateName);
        if (!template || !settings) {
            console.warn(`[Email] Template '${templateName}' or settings not found.`);
            return;
        }

        // Master Switch
        if (settings.enableEmailNotifications === false) return;

        // Granular Checks
        switch (templateName) {
            case 'welcome_email': if (!settings.enableEmailWelcome) return; break;
            case 'new_order_customer': if (!settings.enableEmailNewOrder) return; break;
            case 'order_processing': if (!settings.enableEmailOrderProcessing) return; break;
            case 'order_shipped': if (!settings.enableEmailOrderShipped) return; break;
            case 'order_cancelled': if (!settings.enableEmailOrderCancelled) return; break;
            case 'order_refunded': if (!settings.enableEmailOrderRefunded) return; break;
            
            case 'return_requested': if (!settings.enableEmailReturnRequested) return; break;
            case 'return_approved': if (!settings.enableEmailReturnApproved) return; break;
            case 'return_rejected': if (!settings.enableEmailReturnRejected) return; break;

            case 'newsletter_welcome': if (!settings.enableEmailNewsletterWelcome) return; break;
            case 'contact_autoreply': if (!settings.enableEmailContactAutoreply) return; break;
            
            case 'admin_new_order': if (!settings.enableEmailAdminNewOrder) return; break;
            case 'contact_notification_admin': if (!settings.enableEmailContactAdmin) return; break;
            case 'admin_return_alert': if (!settings.enableEmailAdminReturnAlert) return; break;
            
            // guest_order_account_created is tied to new order logic typically
            case 'guest_order_account_created': if (!settings.enableEmailNewOrder) return; break;
        }

        const allVariables = { ...variables, '{{logo_url}}': settings.logoImage || 'https://i.imgur.com/pkaScEv.png', '{{shop_url}}': 'https://jamboapparels.com', '{{contact_email}}': settings.contactEmail || 'support@jamboapparels.com' };
        let subject = template.subject;
        let body = template.bodyHtml;

        Object.entries(allVariables).forEach(([key, value]) => {
            subject = subject.replace(new RegExp(key, 'g'), value);
            body = body.split(key).join(value);
        });

        await this.sendTestTemplate(recipient, subject, body);
    } catch (e) {
        console.error(`[Email] Failed to send ${templateName}:`, e);
    }
  }
}

export class SupportService {
  private settingsService = new SettingsService();

  async subscribeNewsletter(email: string, source: string = 'website'): Promise<void> {
    log('INSERT', 'newsletter_subscribers', email);
    const { error } = await supabase.from('newsletter_subscribers').upsert({ email, source, subscribed_at: new Date().toISOString(), is_subscribed: true } as any, { onConflict: 'email' });
    if (error) throw error;
    this.settingsService.sendTransactionalEmail('newsletter_welcome', email, { '{{shop_link}}': 'https://jamboapparels.com/shop' });
  }

  async submitContact(data: { name: string, email: string, message: string, subject?: string }): Promise<void> {
    log('INSERT', 'contact_submissions', data.email);
    const { error } = await supabase.from('contact_submissions').insert({ ...data } as any);
    if (error) throw error;

    const adminSettings = await this.settingsService.get();
    if (adminSettings?.contactEmail) this.settingsService.sendTransactionalEmail('contact_notification_admin', adminSettings.contactEmail, { '{{sender_name}}': data.name, '{{sender_email}}': data.email, '{{subject}}': data.subject || 'New Inquiry', '{{message}}': data.message });
    this.settingsService.sendTransactionalEmail('contact_autoreply', data.email, { '{{sender_name}}': data.name, '{{subject}}': data.subject || 'Inquiry' });
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    log('SELECT', 'newsletter_subscribers');
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbNewsletterSubscriber[]).map(Mappers.toNewsletterSubscriber);
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    log('SELECT', 'contact_submissions');
    const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbContactSubmission[]).map(Mappers.toContactSubmission);
  }

  async markContactSubmissionAsRead(id: string): Promise<void> {
    log('UPDATE', 'contact_submissions', { id, is_read: true });
    const { error } = await supabase.from('contact_submissions').update({ is_read: true } as any).eq('id', id);
    if (error) throw error;
  }

  async deleteContactSubmission(id: string): Promise<void> {
    log('DELETE', 'contact_submissions', id);
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteNewsletterSubscriber(id: string): Promise<void> {
    log('DELETE', 'newsletter_subscribers', id);
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) throw error;
  }
}
