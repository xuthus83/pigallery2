export enum TaskTriggerType {
  never = 1, scheduled = 2, periodic = 3
}

export interface TaskTrigger {
  type: TaskTriggerType;
}

export interface NeverTaskTrigger {
  type: TaskTriggerType.never;
}

export interface ScheduledTaskTrigger extends TaskTrigger {
  type: TaskTriggerType.scheduled;
  time: number;  // data time
}

export interface PeriodicTaskTrigger extends TaskTrigger {
  type: TaskTriggerType.periodic;
  periodicity: number;  // 0-6: week days 7 every day
  atTime: number; // day time
}

export interface TaskScheduleDTO {
  taskName: string;
  config: any;
  trigger: NeverTaskTrigger | ScheduledTaskTrigger | PeriodicTaskTrigger;
}
