import {expect} from 'chai';
import {TaskManager} from '../../../../../src/backend/model/tasks/TaskManager';
import {TaskScheduleDTO, TaskTriggerType} from '../../../../../src/common/entities/task/TaskScheduleDTO';

class TaskManagerSpec extends TaskManager {

  public getDateFromSchedule(refDate: Date, schedule: TaskScheduleDTO): Date {
    return super.getDateFromSchedule(refDate, schedule);
  }
}

describe('TaskManager', () => {

  it('should get date from schedule', async () => {
    const tm = new TaskManagerSpec();

    const refDate = new Date(2019, 7, 18, 5, 10, 10, 0); // its a sunday


    expect(tm.getDateFromSchedule(refDate, <any>{
      trigger: {
        type: TaskTriggerType.scheduled,
        time: (new Date(2019, 7, 18, 5, 10)).getTime()
      }
    })).to.be.deep.equal((new Date(2019, 7, 18, 5, 10, 0)));


    for (let dayOfWeek = 0; dayOfWeek < 7; ++dayOfWeek) {
      let nextDay = dayOfWeek < 6 ? (18 + dayOfWeek + 1) : 18;

      let h = 10;
      let m = 5;
      expect(tm.getDateFromSchedule(refDate, <any>{
        trigger: {
          type: TaskTriggerType.periodic,
          atTime: (h * 60 + m) * 60 * 1000,
          periodicity: dayOfWeek
        }
      })).to.be.deep.equal((new Date(2019, 7, nextDay, h, m, 0)), 'for day: ' + dayOfWeek);

      h = 2;
      m = 5;
      nextDay = 18 + dayOfWeek + 1;
      expect(tm.getDateFromSchedule(refDate, <any>{
        trigger: {
          type: TaskTriggerType.periodic,
          atTime: (h * 60 + m) * 60 * 1000,
          periodicity: dayOfWeek
        }
      })).to.be.deep.equal((new Date(2019, 7, nextDay, h, m, 0)), 'for day: ' + dayOfWeek);

      h = 5;
      m = 10;
      nextDay = 18 + dayOfWeek + 1;
      expect(tm.getDateFromSchedule(refDate, <any>{
        trigger: {
          type: TaskTriggerType.periodic,
          atTime: (h * 60 + m) * 60 * 1000,
          periodicity: dayOfWeek
        }
      })).to.be.deep.equal((new Date(2019, 7, nextDay, h, m, 0)), 'for day: ' + dayOfWeek);
    }

    {
      const h = 10;
      const m = 5;
      expect(tm.getDateFromSchedule(refDate, <any>{
        trigger: {
          type: TaskTriggerType.periodic,
          atTime: (h * 60 + m) * 60 * 1000,
          periodicity: 7
        }
      })).to.be.deep.equal((new Date(2019, 7, 18, h, m, 0)));
    }
    {
      const h = 2;
      const m = 5;
      expect(tm.getDateFromSchedule(refDate, <any>{
        trigger: {
          type: TaskTriggerType.periodic,
          atTime: (h * 60 + m) * 60 * 1000,
          periodicity: 7
        }
      })).to.be.deep.equal((new Date(2019, 7, 19, h, m, 0)));
    }
  });

});
