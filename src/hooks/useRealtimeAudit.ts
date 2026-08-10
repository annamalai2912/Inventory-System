import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ChangeType } from '../types';

export interface AuditLogExtended {
  id: string;
  component_id: string;
  component_name?: string;
  category?: string;
  user_id: string | null;
  user_name: string;
  user_avatar?: string | null;
  change_type: ChangeType;
  quantity_delta: number;
  project_tag: string | null;
  notes: string | null;
  timestamp: string;
}

export function useRealtimeAudit() {
  const [logs, setLogs] = useState<AuditLogExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLive] = useState(true);

  const fetchAllLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_logs')
        .select(`
          id,
          component_id,
          change_type,
          quantity_delta,
          project_tag,
          notes,
          timestamp,
          profiles (name, avatar_url),
          components (name, category)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!error && data) {
        const formatted: AuditLogExtended[] = data.map((item: any) => ({
          id: item.id,
          component_id: item.component_id,
          component_name: item.components?.name || 'Component',
          category: item.components?.category || 'other',
          user_id: item.user_id,
          user_name: item.profiles?.name || 'Team Member',
          user_avatar: item.profiles?.avatar_url,
          change_type: item.change_type,
          quantity_delta: item.quantity_delta,
          project_tag: item.project_tag,
          notes: item.notes,
          timestamp: item.timestamp,
        }));
        setLogs(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLogs();

    const channel = supabase
      .channel('admin-audit-logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_logs' },
        async (payload) => {
          const newId = payload.new.id;
          const { data } = await supabase
            .from('stock_logs')
            .select(`
              id,
              component_id,
              change_type,
              quantity_delta,
              project_tag,
              notes,
              timestamp,
              profiles (name, avatar_url),
              components (name, category)
            `)
            .eq('id', newId)
            .single();

          if (data) {
            const newItem: AuditLogExtended = {
              id: data.id,
              component_id: data.component_id,
              component_name: (data.components as any)?.name || 'Component',
              category: (data.components as any)?.category || 'other',
              user_id: (data as any).user_id,
              user_name: (data.profiles as any)?.name || 'Team Member',
              user_avatar: (data.profiles as any)?.avatar_url,
              change_type: (data as any).change_type,
              quantity_delta: (data as any).quantity_delta,
              project_tag: (data as any).project_tag,
              notes: (data as any).notes,
              timestamp: (data as any).timestamp,
            };
            setLogs((prev) => [newItem, ...prev.filter((l) => l.id !== newItem.id)]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllLogs]);

  return { logs, loading, isLive, refetch: fetchAllLogs };
}
