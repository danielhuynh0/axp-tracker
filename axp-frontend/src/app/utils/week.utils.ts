export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = weekStart.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export function getAllowedWeeks(): Date[] {
  const today = new Date();
  const currentMonday = getWeekStart(today);
  const weeks: Date[] = [];

  const start = new Date(currentMonday);
  start.setDate(start.getDate() - 52 * 7);

  for (let d = new Date(start); ; d.setDate(d.getDate() + 7)) {
    const monday = new Date(d);
    weeks.push(monday);
    const twoAhead = new Date(currentMonday);
    twoAhead.setDate(twoAhead.getDate() + 14);
    if (monday >= twoAhead) break;
  }

  return weeks.reverse();
}
