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
  periodicity: number;  // 1-7: week days 8+ every x days
  atTime: number; // day time
}

export interface TaskScheduleDTO {
  priority: number;
  name?: string;
  id?: string;
  taskName: string;
  config: any;
  trigger: NeverTaskTrigger | ScheduledTaskTrigger | PeriodicTaskTrigger;
}
