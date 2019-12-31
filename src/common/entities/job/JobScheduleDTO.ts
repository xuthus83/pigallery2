export enum JobTriggerType {
  never = 1, scheduled = 2, periodic = 3, after = 4
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

export interface AfterJobTrigger extends JobTrigger {
  type: JobTriggerType.after;
  afterScheduleName: string; // runs after schedule
}

export interface JobScheduleDTO {
  name: string;
  jobName: string;
  config: any;
  allowParallelRun: boolean;
  trigger: NeverJobTrigger | ScheduledJobTrigger | PeriodicJobTrigger | AfterJobTrigger;
}


export module JobScheduleDTO {

  const getNextDayOfTheWeek = (refDate: Date, dayOfWeek: number) => {
    const date = new Date(refDate);
    date.setDate(refDate.getDate() + (dayOfWeek + 1 + 7 - refDate.getDay()) % 7);
    if (date.getDay() === refDate.getDay()) {
      return new Date(refDate);
    }
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const nextValidDate = (date: Date, h: number, m: number, dayDiff: number): Date => {

    date.setSeconds(0);
    if (date.getHours() < h || (date.getHours() === h && date.getMinutes() < m)) {
      date.setHours(h);
      date.setMinutes(m);
    } else {
      date.setTime(date.getTime() + dayDiff);
      date.setHours(h);
      date.setMinutes(m);
    }
    return date;
  };

  export const getNextRunningDate = (refDate: Date, schedule: JobScheduleDTO): Date => {
    switch (schedule.trigger.type) {
      case JobTriggerType.scheduled:
        return new Date(schedule.trigger.time);

      case JobTriggerType.periodic:


        const hour = Math.floor(schedule.trigger.atTime / 1000 / (60 * 60));
        const minute = (schedule.trigger.atTime / 1000 / 60) % 60;

        if (schedule.trigger.periodicity <= 6) { // Between Monday and Sunday
          const nextRunDate = getNextDayOfTheWeek(refDate, schedule.trigger.periodicity);
          return nextValidDate(nextRunDate, hour, minute, 7 * 24 * 60 * 60 * 1000);
        }

        // every day
        return nextValidDate(new Date(refDate), hour, minute, 24 * 60 * 60 * 1000);
    }
    return null;
  };
}
