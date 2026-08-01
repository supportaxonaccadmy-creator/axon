import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { MessageTemplate, CreateTemplateInput, TemplateType } from './notification.types';
import { mapTemplateRow, extractVariables } from './notificationHelpers';

export const messageTemplateService = {
  async create(adminId: string, input: CreateTemplateInput): Promise<{ data: MessageTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const variables = input.variables ?? extractVariables(input.body);
      const { data, error } = await supabase.from('message_templates').insert({
        name: input.name,
        type: input.type,
        subject: input.subject,
        body: input.body,
        variables,
        is_active: true,
        created_by: adminId,
      }).select('*').maybeSingle();

      if (error) { logger.error('messageTemplateService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateTemplateInput>): Promise<{ data: MessageTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.subject !== undefined) updateData.subject = input.subject;
      if (input.body !== undefined) {
        updateData.body = input.body;
        updateData.variables = input.variables ?? extractVariables(input.body);
      }
      if (input.variables !== undefined) updateData.variables = input.variables;

      const { data, error } = await supabase.from('message_templates').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('messageTemplateService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('message_templates').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(): Promise<{ data: MessageTemplate[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapTemplateRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByType(type: TemplateType): Promise<{ data: MessageTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('message_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: MessageTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('message_templates').select('*').eq('id', id).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async toggleActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('message_templates').update({ is_active: isActive }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  getDefaultTemplates(): Array<{ type: TemplateType; name: string; subject: string; body: string }> {
    return [
      {
        type: 'welcome', name: 'Welcome Email',
        subject: 'Welcome to {{platform_name}}, {{student_name}}!',
        body: 'Hi {{student_name}},\n\nWelcome to {{platform_name}}! We are excited to have you on board. Start exploring our courses and begin your learning journey today.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'purchase_success', name: 'Purchase Success',
        subject: 'Purchase Confirmation - {{batch_name}}',
        body: 'Hi {{student_name}},\n\nYour purchase of {{batch_name}} for {{amount}} has been successfully processed. You now have full access to all course materials.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'enrollment', name: 'Enrollment Confirmation',
        subject: 'Enrolled in {{batch_name}}',
        body: 'Hi {{student_name}},\n\nYou have been successfully enrolled in {{batch_name}}. You can now access all classes, videos, PDFs, and MCQs for this batch.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'password_reset', name: 'Password Reset',
        subject: 'Reset Your Password',
        body: 'Hi {{student_name}},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n{{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'payment_failed', name: 'Payment Failed',
        subject: 'Payment Failed for {{batch_name}}',
        body: 'Hi {{student_name}},\n\nYour payment for {{batch_name}} could not be processed. Error: {{error_message}}\n\nPlease try again or contact support.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'live_reminder', name: 'Live Class Reminder',
        subject: 'Live Class Starting Soon - {{class_title}}',
        body: 'Hi {{student_name}},\n\nThis is a reminder that your live class "{{class_title}}" will start in {{time_until}}.\n\nJoin the class from your dashboard.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'certificate', name: 'Certificate Ready',
        subject: 'Your Certificate is Ready - {{batch_name}}',
        body: 'Hi {{student_name}},\n\nCongratulations on completing {{batch_name}}! Your certificate is now ready for download.\n\nVisit your dashboard to download your certificate.\n\nBest regards,\nThe {{platform_name}} Team',
      },
      {
        type: 'custom', name: 'Custom Template',
        subject: '{{subject}}',
        body: '{{message}}',
      },
    ];
  },
};
