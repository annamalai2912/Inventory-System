import Fuse from 'fuse.js';
import type { Component } from '../types';

const SIMILARITY_THRESHOLD = 0.35; // Fuse score: 0 = perfect, 1 = no match

export interface DuplicateMatch {
  component: Component;
  score: number;
}

/**
 * Finds near-duplicate components by fuzzy matching on name + category.
 * Returns matches sorted by best score first.
 */
export function findDuplicates(
  name: string,
  category: string,
  allComponents: Component[],
  excludeId?: string,
): DuplicateMatch[] {
  if (!name.trim()) return [];

  // Filter to same category first (exact), then fuzzy match name
  const pool = allComponents.filter(
    (c) => c.id !== excludeId && c.category === category,
  );

  const fuse = new Fuse(pool, {
    keys: ['name'],
    includeScore: true,
    threshold: SIMILARITY_THRESHOLD,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const results = fuse.search(name.trim());
  return results.map((r) => ({
    component: r.item,
    score: r.score ?? 1,
  }));
}

/**
 * Quick boolean check for duplicate existence.
 */
export function hasDuplicates(
  name: string,
  category: string,
  allComponents: Component[],
  excludeId?: string,
): boolean {
  return findDuplicates(name, category, allComponents, excludeId).length > 0;
}
