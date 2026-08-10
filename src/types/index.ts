import type { Database } from '../lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Component = Database['public']['Tables']['components']['Row'];
export type StockLog = Database['public']['Tables']['stock_logs']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];

export type ChangeType = 'add' | 'remove' | 'use' | 'restock' | 'adjust';

export const CATEGORIES = [
  'microcontroller',
  'sensor',
  'passive',
  'connector',
  'module',
  'tool',
  'power',
  'display',
  'communication',
  'actuator',
  'cable',
  'other',
] as const;

export type Category = typeof CATEGORIES[number];

export interface StockLogWithUser extends StockLog {
  profiles: Pick<Profile, 'name' | 'avatar_url'> | null;
}

export interface ComponentWithUser extends Component {
  profiles: Pick<Profile, 'name' | 'avatar_url'> | null;
}

export interface DashboardStats {
  totalPartTypes: number;
  totalUnits: number;
  lowStockCount: number;
  categoryBreakdown: { category: string; count: number; units: number }[];
  mostUsed: { component: Component; usageCount: number }[];
}

export interface FilterState {
  search: string;
  category: string;
  lowStockOnly: boolean;
  addedBy: string;
  sortBy: 'name' | 'quantity' | 'updated_at' | 'category';
  sortDir: 'asc' | 'desc';
}
