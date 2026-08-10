import { useCallback } from 'react';
import Papa from 'papaparse';
import type { Component } from '../types';

export function useExport() {
  const exportCSV = useCallback((components: Component[], filename = 'techknots-inventory') => {
    const rows = components.map((c) => ({
      Name: c.name,
      Category: c.category,
      Tags: c.sub_tags?.join(', ') ?? '',
      Quantity: c.quantity,
      Unit: c.unit,
      'Low Stock Threshold': c.low_stock_threshold,
      'Datasheet URL': c.datasheet_url ?? '',
      Notes: c.notes ?? '',
      'Added By': c.added_by ?? '',
      'Created At': new Date(c.created_at).toLocaleString(),
      'Last Updated': new Date(c.updated_at).toLocaleString(),
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return { exportCSV };
}
