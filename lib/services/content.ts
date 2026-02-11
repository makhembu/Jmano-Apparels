
import { supabase } from '../supabaseClient';
import { supabasePublic } from '../supabasePublicClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { AppSettings, EmailTemplate, BlogPost, BlogCategory, BlogComment } from '../../types';

export class SettingsService {
  async get(): Promise<AppSettings | null> {
    const { data, error } = await supabasePublic.from('public_app_settings').select('*').limit(1).maybeSingle();
    if (error) {
        console.error("Failed to fetch public settings", error);
        return null;
    }
    return Mappers.toAppSettings(data || {});
  }

  async getAdminSettings(): Promise<AppSettings | null> {
    const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
    if (error) return null;
    return Mappers.toAppSettings(data);
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    // Map camelCase to snake_case for DB
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
      seo_title: settings.seoTitle,
      seo_description: settings.seoDescription,
      default_og_image: settings.defaultOgImage,
      google_analytics_id: settings.googleAnalyticsId,
      custom_head_scripts: settings.customHeadScripts,
      shop_seo_title: settings.shopSeoTitle,
      shop_seo_description: settings.shopSeoDescription,
      blog_seo_title: settings.blogSeoTitle,
      blog_seo_description: settings.blogSeoDescription,
      about_seo_title: settings.aboutSeoTitle,
      about_seo_description: settings.aboutSeoDescription,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      contact_address: settings.contactAddress,
      business_hours: settings.businessHours,
      social_links: settings.socialLinks,
      support_email: settings.supportEmail,
      currency: settings.currency,
      tax_rate: settings.taxRate,
      free_shipping_threshold: settings.freeShippingThreshold,
      require_login_for_checkout: settings.requireLoginForCheckout,
      shipping_policy: settings.shippingPolicy,
      return_policy: settings.returnPolicy,
      privacy_policy: settings.privacyPolicy,
      terms_conditions: settings.termsConditions,
      hero_banner_image: settings.heroBannerImage,
      hero_banner_text: settings.heroBannerText,
      announcement_text: settings.announcementText,
      is_announcement_enabled: settings.isAnnouncementEnabled,
      maintenance_mode: settings.maintenanceMode,
      maintenance_message: settings.maintenanceMessage,
      featured_categories: settings.featuredCategories,
      resend_api_key: settings.resendApiKey,
      resend_from_email: settings.resendFromEmail,
      gemini_api_key: settings.geminiApiKey,
      whatsapp_access_token: settings.whatsappAccessToken,
      whatsapp_phone_number_id: settings.whatsappPhoneNumberId,
      whatsapp_business_account_id: settings.whatsappBusinessAccountId,
      admin_phone_number: settings.adminPhoneNumber,
      enable_whatsapp_notifications: settings.enableWhatsappNotifications,
      enable_email_notifications: settings.enableEmailNotifications,
      enable_email_welcome: settings.enableEmailWelcome,
      enable_email_new_order: settings.enableEmailNewOrder,
      enable_email_order_shipped: settings.enableEmailOrderShipped,
      enable_email_admin_new_order: settings.enableEmailAdminNewOrder,
      enable_email_contact_admin: settings.enableEmailContactAdmin,
      enable_email_order_processing: settings.enableEmailOrderProcessing,
      enable_email_order_cancelled: settings.enableEmailOrderCancelled,
      enable_email_order_refunded: settings.enableEmailOrderRefunded,
      enable_email_return_requested: settings.enableEmailReturnRequested,
      enable_email_return_approved: settings.enableEmailReturnApproved,
      enable_email_return_rejected: settings.enableEmailReturnRejected,
      enable_email_contact_autoreply: settings.enableEmailContactAutoreply,
      enable_email_newsletter_welcome: settings.enableEmailNewsletterWelcome,
      enable_email_admin_return_alert: settings.enableEmailAdminReturnAlert,
      enable_newsletter_signup: settings.enableNewsletterSignup,
      enable_contact_form: settings.enableContactForm,
      enable_reviews: settings.enableReviews,
      paypal_client_id: settings.paypalClientId,
      paypal_secret_key: settings.paypalSecretKey,
      paypal_mode: settings.paypalMode,
      paypal_webhook_id: settings.paypalWebhookId,
      payment_gateway_enabled: settings.paymentGatewayEnabled,
      enable_featured_products: settings.enableFeaturedProducts,
      enable_commitment_section: settings.enableCommitmentSection,
      enable_categories_section: settings.enableCategoriesSection,
      enable_community_section: settings.enableCommunitySection,
      enable_journal_section: settings.enableJournalSection,
      enable_social_section: settings.enableSocialSection,
      seo_content_title: settings.seoContentTitle,
      seo_content_intro: settings.seoContentIntro,
      seo_content_col1_title: settings.seoContentCol1Title,
      seo_content_col1_body: settings.seoContentCol1Body,
      seo_content_col2_title: settings.seoContentCol2Title,
      seo_content_col2_body: settings.seoContentCol2Body,
      social_section_title: settings.socialSectionTitle,
      social_section_body: settings.socialSectionBody,
      priority_pages: settings.priorityPages,
      company_name: settings.companyName,
      registration_number: settings.registrationNumber,
      vat_number: settings.vatNumber,
      payment_instructions: settings.paymentInstructions,
      payment_terms: settings.paymentTerms,
      about_hero_tag: settings.aboutHeroTag,
      about_hero_title: settings.aboutHeroTitle,
      about_founder_tag: settings.aboutFounderTag,
      about_mission_title: settings.aboutMissionTitle,
      about_mission_body: settings.aboutMissionBody,
      about_vision_title: settings.aboutVisionTitle,
      about_vision_body: settings.aboutVisionBody,
      about_values_tag: settings.aboutValuesTag,
      about_values_title: settings.aboutValuesTitle,
      about_values_intro: settings.aboutValuesIntro,
      about_value_1_title: settings.aboutValue1Title,
      about_value_1_body: settings.aboutValue1Body,
      about_value_2_title: settings.aboutValue2Title,
      about_value_2_body: settings.aboutValue2Body,
      about_value_3_title: settings.aboutValue3Title,
      about_value_3_body: settings.aboutValue3Body
    };

    // Remove undefined values
    Object.keys(dbSettings).forEach(key => dbSettings[key] === undefined && delete dbSettings[key]);

    // Use a known ID (e.g., 1) for the single settings row
    const { error } = await supabase.from('app_settings').update(dbSettings).eq('id', 1);
    if (error) throw error;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase.from('email_templates').select('*');
    if (error) throw error;
    return (data || []).map(Mappers.toEmailTemplate);
  }

  async updateEmailTemplate(id: string, template: Partial<EmailTemplate>): Promise<void> {
    const { error } = await supabase.from('email_templates').update({
        subject: template.subject,
        body_html: template.bodyHtml,
        whatsapp_body_text: template.whatsappBodyText
    }).eq('id', id);
    if (error) throw error;
  }

  async sendTestTemplate(to: string, subject: string, body: string): Promise<{success: boolean, message?: string}> {
    try {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to,
                subject,
                htmlBody: body
            })
        });
        const data = await res.json();
        return { success: res.ok, message: data.error || 'Email sent' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
  }

  async checkEmailHealth(email: string, key?: string, from?: string): Promise<{success: boolean, message?: string}> {
      try {
          const res = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  to: email,
                  subject: 'Jambo Apparels - System Health Check',
                  htmlBody: '<p>Your email configuration is healthy.</p>',
                  providerConfig: { apiKey: key, from: from },
                  testMode: true
              })
          });
          const data = await res.json();
          return { success: res.ok, message: data.error || 'Health check passed' };
      } catch (e: any) {
          return { success: false, message: e.message };
      }
  }

  async sendWhatsAppMessage(to: string, text: string): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, text })
        });
        const data = await response.json();
        if (!response.ok) {
            console.warn('[WhatsApp] Send failed', data.error);
            return { success: false, message: data.error || 'Unknown error' };
        }
        log('SEND_WHATSAPP', 'success', { to });
        return { success: true };
    } catch (e: any) {
        console.error('[WhatsApp] Transport error', e);
        return { success: false, message: e.message || 'Transport error' };
    }
  }

  async sendTransactionalEmail(templateName: string, recipientEmail: string, variables: Record<string, string>): Promise<void> {
    try {
        log('SEND_NOTIFICATION', templateName, recipientEmail);
        const [templates, settings] = await Promise.all([this.getEmailTemplates(), this.get()]);
        const template = templates.find(t => t.name === templateName);
        if (!template || !settings) {
            console.warn(`[Notification] Template '${templateName}' or settings not found.`);
            return;
        }

        // Master Switch for Emails
        const emailAllowed = settings.enableEmailNotifications !== false;
        
        // Granular Check Logic (Determine if this specific event type is enabled)
        let eventEnabled = true;
        let isAdminAlert = false;
        
        switch (templateName) {
            case 'welcome_email': eventEnabled = !!settings.enableEmailWelcome; break;
            case 'new_order_customer': eventEnabled = !!settings.enableEmailNewOrder; break;
            case 'order_processing': eventEnabled = !!settings.enableEmailOrderProcessing; break;
            case 'order_shipped': eventEnabled = !!settings.enableEmailOrderShipped; break;
            case 'order_cancelled': eventEnabled = !!settings.enableEmailOrderCancelled; break;
            case 'order_refunded': eventEnabled = !!settings.enableEmailOrderRefunded; break;
            
            case 'return_requested': eventEnabled = !!settings.enableEmailReturnRequested; break;
            case 'return_approved': eventEnabled = !!settings.enableEmailReturnApproved; break;
            case 'return_rejected': eventEnabled = !!settings.enableEmailReturnRejected; break;

            case 'newsletter_welcome': eventEnabled = !!settings.enableEmailNewsletterWelcome; break;
            case 'contact_autoreply': eventEnabled = !!settings.enableEmailContactAutoreply; break;
            
            case 'admin_new_order': 
                eventEnabled = !!settings.enableEmailAdminNewOrder; 
                isAdminAlert = true; 
                break;
            case 'contact_notification_admin': 
                eventEnabled = !!settings.enableEmailContactAdmin; 
                isAdminAlert = true; 
                break;
            case 'admin_return_alert': 
                eventEnabled = !!settings.enableEmailAdminReturnAlert; 
                isAdminAlert = true; 
                break;
            
            case 'guest_order_account_created': eventEnabled = !!settings.enableEmailNewOrder; break;
        }

        if (!eventEnabled) return;

        // 1. Send Email
        if (emailAllowed) {
            const allVariables = { ...variables, '{{logo_url}}': settings.logoImage || 'https://i.imgur.com/pkaScEv.png', '{{shop_url}}': 'https://jamboapparels.com', '{{contact_email}}': settings.contactEmail || 'support@jamboapparels.com' };
            let subject = template.subject;
            let body = template.bodyHtml;

            Object.entries(allVariables).forEach(([key, value]) => {
                subject = subject.replace(new RegExp(key, 'g'), value);
                body = body.split(key).join(value);
            });

            await this.sendTestTemplate(recipientEmail, subject, body);
        }

        // 2. Send WhatsApp (if enabled globally and template has text)
        if (settings.enableWhatsappNotifications && template.whatsappBodyText) {
            // Determine recipient phone
            let whatsappRecipient = '';
            
            if (isAdminAlert) {
                whatsappRecipient = settings.adminPhoneNumber || '';
            } else {
                if (recipientEmail) {
                    const { data: user } = await supabase.from('users').select('id').eq('email', recipientEmail).single();
                    if (user) {
                         const { data: address } = await supabase.from('user_addresses').select('phone').eq('user_id', user.id).eq('is_default', true).single();
                         if (address?.phone) whatsappRecipient = address.phone;
                    }
                }
            }

            if (whatsappRecipient && template.whatsappBodyText) {
                let msg = template.whatsappBodyText;
                // Reuse variables
                Object.entries(variables).forEach(([key, value]) => {
                    msg = msg.split(key).join(value);
                });
                // Common replacements
                msg = msg.replace('{{shop_url}}', 'https://jamboapparels.com');
                
                await this.sendWhatsAppMessage(whatsappRecipient, msg);
            }
        }

    } catch (e) {
        console.error(`[Notification] Failed to send ${templateName}:`, e);
    }
  }
}

export class BlogService {
  async getAll(): Promise<BlogPost[]> {
    log('SELECT', 'blog_posts', 'ALL');
    const { data, error } = await supabasePublic.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(Mappers.toBlogPost);
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    log('SELECT', 'blog_posts', slug);
    const { data, error } = await supabasePublic.from('blog_posts').select('*').eq('slug', slug).single();
    if (error) return null;
    return Mappers.toBlogPost(data);
  }

  async create(post: Partial<BlogPost>): Promise<void> {
    log('INSERT', 'blog_posts', post.title);
    const dbPost = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        summary: post.summary,
        author: post.author,
        status: post.status,
        date: post.createdAt,
        featured_image: post.featuredImage,
        thumbnail: post.thumbnail,
        reading_time: post.readingTime,
        category_id: post.categoryId,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        canonical_url: post.canonicalUrl,
        is_noindex: post.isNoIndex,
        is_nofollow: post.isNoFollow,
        keywords: post.keywords,
        scheduled_for: post.scheduledFor
    };
    const { error } = await supabase.from('blog_posts').insert(dbPost as any);
    if (error) throw error;
  }

  async update(id: string, post: Partial<BlogPost>): Promise<void> {
    log('UPDATE', 'blog_posts', id);
    const dbPost: any = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        summary: post.summary,
        author: post.author,
        status: post.status,
        featured_image: post.featuredImage,
        thumbnail: post.thumbnail,
        reading_time: post.readingTime,
        category_id: post.categoryId,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        canonical_url: post.canonicalUrl,
        is_noindex: post.isNoIndex,
        is_nofollow: post.isNoFollow,
        keywords: post.keywords,
        scheduled_for: post.scheduledFor,
        updated_at: new Date().toISOString()
    };
    Object.keys(dbPost).forEach(key => dbPost[key] === undefined && delete dbPost[key]);
    const { error } = await supabase.from('blog_posts').update(dbPost).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    log('DELETE', 'blog_posts', id);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  }

  async bulkUpdate(ids: string[], updates: Partial<BlogPost>): Promise<void> {
    log('BULK_UPDATE', 'blog_posts', ids.length);
    for (const id of ids) {
        await this.update(id, updates);
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    log('BULK_DELETE', 'blog_posts', ids.length);
    const { error } = await supabase.from('blog_posts').delete().in('id', ids);
    if (error) throw error;
  }

  async incrementView(id: string): Promise<void> {
    // Basic increment, better to use RPC for atomicity
    const { error } = await supabase.rpc('increment_blog_view', { post_id: id });
    if (error) console.warn("Failed to increment view", error);
  }

  async getCategories(): Promise<BlogCategory[]> {
    log('SELECT', 'blog_categories');
    const { data, error } = await supabasePublic.from('blog_categories').select('*');
    if (error) throw error;
    return (data || []).map(Mappers.toBlogCategory);
  }

  async createCategory(cat: Partial<BlogCategory>): Promise<void> {
    log('INSERT', 'blog_categories', cat.name);
    const { error } = await supabase.from('blog_categories').insert(cat as any);
    if (error) throw error;
  }

  async deleteCategory(id: string): Promise<void> {
    log('DELETE', 'blog_categories', id);
    const { error } = await supabase.from('blog_categories').delete().eq('id', id);
    if (error) throw error;
  }

  async getComments(postId: string): Promise<BlogComment[]> {
    log('SELECT', 'blog_comments', postId);
    const { data, error } = await supabasePublic
        .from('blog_comments')
        .select('*, user:users(name)')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(Mappers.toBlogComment);
  }

  async addComment(postId: string, userId: string, comment: string): Promise<void> {
    log('INSERT', 'blog_comments', postId);
    const { error } = await supabase.from('blog_comments').insert({
        post_id: postId,
        user_id: userId,
        comment,
        is_approved: true // Auto-approve for demo
    } as any);
    if (error) throw error;
  }

  async incrementLike(postId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_blog_like', { post_id_to_inc: postId });
    if (error) throw error;
  }
}
