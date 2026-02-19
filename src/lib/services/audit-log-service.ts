import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: 'booking' | 'labour_booking' | 'equipment' | 'labour_profile' | 'user';
  entity_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export const auditLogService = {
  // Create audit log entry
  async create(log: {
    user_id: string;
    action: string;
    entity_type: AuditLog['entity_type'];
    entity_id: string;
    details?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get audit logs for an entity
  async getByEntity(
    entity_type: AuditLog['entity_type'],
    entity_id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: AuditLog[]; count: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
    };
  },

  // Get audit logs for a user
  async getByUser(
    user_id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: AuditLog[]; count: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
    };
  },
};
