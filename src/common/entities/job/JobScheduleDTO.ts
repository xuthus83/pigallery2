export enum JobTriggerType {
  never = 1, scheduled = 2, periodic = 3
}

export interface JobTrigger {
  type: JobTriggerType;
}

export interface NeverJobTrigger {
  type: JobTriggerType.never;
}

export interface ScheduledJobTrigger extends JobTrigger {
  type: JobTriggerType.scheduled;
  time: number;  // data time
}

export interface PeriodicJobTrigger extends JobTrigger {
  type: JobTriggerType.periodic;
  periodicity: number;  // 0-6: week days 7 every day
  atTime: number; // day time
}

export interface JobScheduleDTO {
  jobName: string;
  config: any;
  trigger: NeverJobTrigger | ScheduledJobTrigger | PeriodicJobTrigger;
}
