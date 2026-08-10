import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useComponentsStore } from '../store/components.store';
import type { Component } from '../types';

export function useComponents() {
  const { components, loading, error, fetchComponents } = useComponentsStore();

  useEffect(() => {
    fetchComponents();

    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('components-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'components' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComp = payload.new as Component;
            useComponentsStore.setState((s) => ({
              components: [newComp, ...s.components.filter((c) => c.id !== newComp.id)],
            }));
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Component;
            useComponentsStore.setState((s) => ({
              components: s.components.map((c) => (c.id === updated.id ? updated : c)),
            }));
          } else if (payload.eventType === 'DELETE') {
            useComponentsStore.setState((s) => ({
              components: s.components.filter((c) => c.id !== (payload.old as Component).id),
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { components, loading, error };
}
