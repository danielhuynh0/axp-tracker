export interface HourAllocation {
  category_id: number;
  category_name: string;
  hours: number;
}

export interface WeeklyEntry {
  id: number;
  task_id: number;
  week_start_date: string;
  total_hours: number;
  allocations: HourAllocation[];
}
