import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth.store';
import type { StockLogWithUser, ChangeType } from '../types';

export function useStockLog(componentId?: string) {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<StockLogWithUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (cId?: string) => {
    const id = cId ?? componentId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from('stock_logs')
      .select('*, profiles(name, avatar_url)')
      .eq('component_id', id)
      .order('timestamp', { ascending: false })
      .limit(50);
    setLogs((data as unknown as StockLogWithUser[]) ?? []);
    setLoading(false);
  }, [componentId]);

  const logChange = useCallback(async (
    cId: string,
    delta: number,
    changeType: ChangeType = 'adjust',
    projectTag?: string,
    notes?: string,
  ) => {
    if (!user) return { error: 'Not authenticated' };

    // Use atomic RPC to update quantity + log in single transaction
    const { data, error } = await (supabase.rpc as any)('increment_quantity', {
      p_component_id: cId,
      p_delta: delta,
      p_user_id: user.id,
      p_change_type: changeType,
      p_project_tag: projectTag ?? null,
      p_notes: notes ?? null,
    });

    if (!error) await fetchLogs(cId);
    return { error: error?.message ?? null, component: data };
  }, [user, fetchLogs]);

  return { logs, loading, fetchLogs, logChange };
}
