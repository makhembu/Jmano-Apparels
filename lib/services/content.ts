import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { BlogPost, BlogCategory, AppSettings, NewsletterSubscriber, ContactSubmission, EmailTemplate, DbBlogPost, DbBlogCategory, DbAppSettings, DbNewsletterSubscriber, DbContactSubmission, DbEmailTemplate } from '../../types';

export class BlogService {
  async getAllPosts(): Promise<BlogPost[]> {
    log('SELECT', 'blog_posts');
    const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbBlogPost[]).map(Mappers.toBlogPost);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    log('SELECT', 'blog_posts', slug);
    const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    if (error) return null;
    return Mappers.toBlogPost(data as DbBlogPost);
  }
  
  async getCategories(): Promise<BlogCategory[]> {
    log('SELECT', 'blog_categories');
    const { data, error } = await supabase.from('blog_categories').select('*');
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
    const { data } = await supabase.from('blog_posts').select('view_count').eq('id', id).single();
    if (data) {
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
      seo_title: post.seoTitle,
      seo_description: post.seoDescription
    };
  }
}

export class SettingsService {
  async get(): Promise<AppSettings | null> {
    log('SELECT', 'app_settings');
    const { data, error } = await supabase.from('app_settings').select('*').single();
    if (error) return null;
    return Mappers.toAppSettings(data as DbAppSettings);
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
      featured_categories: settings.featuredCategories,
      smtp_settings: settings.smtpSettings,
      enable_email_notifications: settings.enableEmailNotifications,
      enable_email_welcome: settings.enableEmailWelcome,
      enable_email_new_order: settings.enableEmailNewOrder,
      enable_email_order_shipped: settings.enableEmailOrderShipped
    };
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

  // --- ADMIN METHODS ---

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