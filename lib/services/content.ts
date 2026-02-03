
import { supabase } from '../supabaseClient';
import { supabasePublic } from '../supabasePublicClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { BlogPost, BlogCategory, AppSettings, NewsletterSubscriber, ContactSubmission, EmailTemplate, DbBlogPost, DbBlogCategory, DbAppSettings, DbNewsletterSubscriber, DbContactSubmission, DbEmailTemplate } from '../../types';

export class BlogService {
  async getAllPosts(): Promise<BlogPost[]> {
    log('SELECT', 'blog_posts');
    // Use public client
    const { data, error } = await supabasePublic.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbBlogPost[]).map(Mappers.toBlogPost);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    log('SELECT', 'blog_posts', slug);
    // Use public client
    const { data, error } = await supabasePublic.from('blog_posts').select('*').eq('slug', slug).single();
    if (error) return null;
    return Mappers.toBlogPost(data as DbBlogPost);
  }
  
  async getCategories(): Promise<BlogCategory[]> {
    log('SELECT', 'blog_categories');
    // Use public client
    const { data, error } = await supabasePublic.from('blog_categories').select('*');
    if (error) throw error;
    return ((data || []) as DbBlogCategory[]).map(Mappers.toBlogCategory);
  }

  async createCategory(category: Partial<BlogCategory>): Promise<void> {
    log('INSERT', 'blog_categories', category);
    const { error } = await supabase.from('blog_categories').insert({
      name: category.name,
      slug: category.slug,
      description: category.description
    });
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
    const { error } = await supabase.from('blog_posts').insert(dbPost);
    if (error) throw error;
  }

  async updatePost(id: string, post: Partial<BlogPost>): Promise<void> {
    log('UPDATE', 'blog_posts', id);
    const dbPost = this.prepareDbBlogPost(post);
    const { error } = await supabase.from('blog_posts').update(dbPost).eq('id', id);
    if (error) throw error;
  }

  async deletePost(id: string): Promise<void> {
    log('DELETE', 'blog_posts', id);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  }

  async incrementViewCount(id: string): Promise<void> {
    log('RPC/UPDATE', 'blog_posts', `increment views for ${id}`);
    // Use public client for select, but write needs proper perms. 
    // Usually view count increment is an RPC or public write policy.
    // For now we'll stick to supabase (auth) or supabasePublic depending on policy.
    // Assuming anyone can increment views:
    const { data } = await supabasePublic.from('blog_posts').select('view_count').eq('id', id).single();
    if (data) {
       // Since this is a write, and often RLS allows only auth users or admins to UPDATE, 
       // but view counts are special. If this fails due to RLS, an RPC is better.
       // We'll leave this as 'supabase' (legacy client) which might be anon or auth.
       await supabase.from('blog_posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
    }
  }

  private prepareDbBlogPost(post: Partial<BlogPost>) {
    return {
      title: post.title,
      summary: post.summary,
      content: post.content,
      slug: post.slug,
      status: post.status,
      featured_image: post.featuredImage,
      thumbnail: post.thumbnail,
      author: post.author,
      reading_time: post.readingTime,
      category_id: post.categoryId,
      
      // SEO
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      canonical_url: post.canonicalUrl,
      is_noindex: post.isNoIndex,
      is_nofollow: post.isNoFollow,
      keywords: post.keywords
    };
  }
}

export class SettingsService {
  async get(): Promise<AppSettings | null> {
    log('SELECT', 'app_settings');
    // Use public client
    const { data, error } = await supabasePublic.from('app_settings').select('*').single();
    if (error) return null;
    return Mappers.toAppSettings(data as DbAppSettings);
  }

  async getPublicPaymentSettings(): Promise<{ paypalClientId: string; paypalMode: string; paymentGatewayEnabled: boolean; currency: string } | null> {
    log('RPC', 'get_public_payment_settings');
    // Use public client for this RPC which is specifically granted to anon
    const { data, error } = await supabasePublic.rpc('get_public_payment_settings');
    if (error) {
      console.error(error);
      return null;
    }
    const settings = data as any;
    return {
      paypalClientId: settings.paypal_client_id,
      paypalMode: settings.paypal_mode,
      paymentGatewayEnabled: settings.payment_gateway_enabled,
      currency: settings.currency
    };
  }

  async update(id: number, settings: Partial<AppSettings>): Promise<void> {
    log('UPDATE', 'app_settings', { id });
    const dbSettings: any = {
      slogan: settings.slogan,
      secondary_slogan: settings.secondarySlogan,
      logo_image: settings.logoImage,
      mission: settings.mission,
      vision: settings.vision,
      core_values: settings.coreValues,
      founder_name: settings.founderName,
      founder_bio: settings.founderBio,
      founder_image: settings.founderImage,
      founder_quote: settings.founderQuote,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      contact_address: settings.contactAddress,
      business_hours: settings.businessHours,
      social_links: settings.socialLinks,
      maintenance_mode: settings.maintenanceMode,
      maintenance_message: settings.maintenanceMessage,
      hero_banner_text: settings.heroBannerText,
      hero_banner_image: settings.heroBannerImage,
      announcement_text: settings.announcementText,
      is_announcement_enabled: settings.isAnnouncementEnabled,
      privacy_policy: settings.privacyPolicy,
      terms_conditions: settings.termsConditions,
      return_policy: settings.returnPolicy,
      shipping_policy: settings.shippingPolicy,
      tax_rate: settings.taxRate,
      free_shipping_threshold: settings.freeShippingThreshold,
      require_login_for_checkout: settings.requireLoginForCheckout,
      featured_categories: settings.featuredCategories,
      email_provider: settings.emailProvider,
      smtp_settings: settings.smtpSettings,
      gemini_api_key: settings.geminiApiKey,
      enable_email_notifications: settings.enableEmailNotifications,
      enable_email_welcome: settings.enableEmailWelcome,
      enable_email_new_order: settings.enableEmailNewOrder,
      enable_email_order_shipped: settings.enableEmailOrderShipped,
      enable_email_admin_new_order: settings.enableEmailAdminNewOrder,
      enable_email_contact_admin: settings.enableEmailContactAdmin,
      enable_newsletter_signup: settings.enableNewsletterSignup,
      enable_contact_form: settings.enableContactForm,
      enable_reviews: settings.enableReviews,
      
      // Global SEO
      seo_title: settings.seoTitle,
      seo_description: settings.seoDescription,
      default_og_image: settings.defaultOgImage,
      google_analytics_id: settings.googleAnalyticsId,
      custom_head_scripts: settings.customHeadScripts,
      
      // Page Specific SEO
      shop_seo_title: settings.shopSeoTitle,
      shop_seo_description: settings.shopSeoDescription,
      blog_seo_title: settings.blogSeoTitle,
      blog_seo_description: settings.blogSeoDescription,
      about_seo_title: settings.aboutSeoTitle,
      about_seo_description: settings.aboutSeoDescription,
      
      // PayPal Settings Mapping
      paypal_client_id: settings.paypalClientId,
      paypal_secret_key: settings.paypalSecretKey,
      paypal_mode: settings.paypalMode,
      payment_gateway_enabled: settings.paymentGatewayEnabled
    };
    
    Object.keys(dbSettings).forEach(key => dbSettings[key] === undefined && delete dbSettings[key]);

    const { error } = await supabase.from('app_settings').update(dbSettings).eq('id', id);
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
    
    const { error } = await supabase.from('email_templates').update(payload).eq('id', id);
    if (error) throw error;
  }
  
  async checkEmailHealth(testEmail: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: 'Jambo Apparels - System Test',
          htmlBody: '<p>This is a test email to verify your configuration settings.</p>',
          testMode: true
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return { success: true };
    } catch (e: any) {
      console.error("Health check failed", e);
      return { success: false, message: e.message || 'Unknown error during test' };
    }
  }

  async sendTestTemplate(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: to,
          subject: subject,
          htmlBody: htmlBody,
          testMode: false
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Unknown error');
      
      return { success: true };
    } catch (e: any) {
      console.error("Test email failed", e);
      return { success: false, message: e.message || 'Unknown error sending test email' };
    }
  }
}

export class SupportService {
  async subscribeNewsletter(email: string, source: string = 'website'): Promise<void> {
    log('INSERT', 'newsletter_subscribers', email);
    const { error } = await supabase.from('newsletter_subscribers').upsert({ 
        email, 
        source, 
        subscribed_at: new Date().toISOString(), 
        is_subscribed: true 
    }, { onConflict: 'email' });
    if (error) throw error;
  }

  async submitContact(data: { name: string, email: string, message: string, subject?: string }): Promise<void> {
    log('INSERT', 'contact_submissions', data.email);
    const { error } = await supabase.from('contact_submissions').insert({
        name: data.name,
        email: data.email,
        message: data.message,
        subject: data.subject
    });
    if (error) throw error;
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    log('SELECT', 'newsletter_subscribers');
    const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbNewsletterSubscriber[]).map(Mappers.toNewsletterSubscriber);
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    log('SELECT', 'contact_submissions');
    const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbContactSubmission[]).map(Mappers.toContactSubmission);
  }

  async markContactSubmissionAsRead(id: string): Promise<void> {
    log('UPDATE', 'contact_submissions', { id, is_read: true });
    const { error } = await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
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
