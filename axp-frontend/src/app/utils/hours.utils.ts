import { TaskCategoryWeight } from '../models/task.model';

export interface PreviewAllocation {
  category_id: number;
  category_name: string;
  hours: number;
}

export function distributeHours(
  totalHours: number,
  weights: TaskCategoryWeight[]
): PreviewAllocation[] {
  const UNIT = 0.25;
  const active = weights.filter((w) => w.weight > 0);
  if (active.length === 0) return [];

  const totalWeight = active.reduce((s, w) => s + w.weight, 0);
  const raw = active.map((w) => ({
    ...w,
    raw: totalHours * (w.weight / totalWeight),
  }));
  const based = raw.map((w) => ({ ...w, base: Math.floor(w.raw / UNIT) * UNIT }));

  const totalBase = based.reduce((s, w) => s + w.base, 0);
  const remainderUnits = Math.round((totalHours - totalBase) / UNIT);
  const sorted = [...based].sort((a, b) => b.raw - b.base - (a.raw - a.base));

  const result = new Map(based.map((w) => [w.category_id, w.base]));
  for (let i = 0; i < remainderUnits; i++) {
    const cat = sorted[i % sorted.length];
    result.set(cat.category_id, (result.get(cat.category_id) ?? 0) + UNIT);
  }

  return active.map((w) => ({
    category_id: w.category_id,
    category_name: w.category_name,
    hours: result.get(w.category_id) ?? 0,
  }));
}
