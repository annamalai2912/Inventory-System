import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Component, FilterState } from '../types';

interface ComponentsState {
  components: Component[];
  loading: boolean;
  error: string | null;
  filter: FilterState;
  setFilter: (partial: Partial<FilterState>) => void;
  fetchComponents: () => Promise<void>;
  deleteComponent: (id: string) => Promise<{ error: string | null }>;
  upsertComponent: (data: Partial<Component>) => Promise<{ error: string | null; id?: string }>;
  getFiltered: () => Component[];
}

const defaultFilter: FilterState = {
  search: '',
  category: '',
  lowStockOnly: false,
  addedBy: '',
  sortBy: 'updated_at',
  sortDir: 'desc',
};

export const useComponentsStore = create<ComponentsState>((set, get) => ({
  components: [],
  loading: false,
  error: null,
  filter: defaultFilter,

  setFilter: (partial) =>
    set((s) => ({ filter: { ...s.filter, ...partial } })),

  fetchComponents: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('updated_at', { ascending: false });
      set({ components: data ?? [], loading: false, error: error?.message ?? null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to fetch components' });
    }
  },

  deleteComponent: async (id) => {
    const { error } = await supabase.from('components').delete().eq('id', id);
    if (!error) {
      set((s) => ({ components: s.components.filter((c) => c.id !== id) }));
    }
    return { error: error?.message ?? null };
  },

  upsertComponent: async (data) => {
    const isNew = !data.id;
    const { data: result, error } = isNew
      ? await supabase.from('components').insert(data as any).select().single()
      : await supabase.from('components').update(data as any).eq('id', data.id!).select().single();

    if (!error && result) {
      set((s) => {
        const existing = s.components.findIndex((c) => c.id === result.id);
        const next = [...s.components];
        if (existing >= 0) next[existing] = result;
        else next.unshift(result);
        return { components: next };
      });
    }
    return { error: error?.message ?? null, id: result?.id };
  },

  getFiltered: () => {
    const { components, filter } = get();
    let list = [...components];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.sub_tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          c.notes?.toLowerCase().includes(q),
      );
    }
    if (filter.category) list = list.filter((c) => c.category === filter.category);
    if (filter.lowStockOnly) list = list.filter((c) => c.quantity <= c.low_stock_threshold);
    if (filter.addedBy) list = list.filter((c) => c.added_by === filter.addedBy);

    list.sort((a, b) => {
      let aVal: string | number = a[filter.sortBy] as string | number;
      let bVal: string | number = b[filter.sortBy] as string | number;
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return filter.sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return filter.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  },
}));
