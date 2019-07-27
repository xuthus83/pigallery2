import {ITask} from './ITask';
import {IndexingTask} from './IndexingTask';
import {DBRestTask} from './DBResetTask';
import {DummyTask} from './DummyTask';

export class TaskRepository {

  private static instance: TaskRepository = null;
  availableTasks: { [key: string]: ITask<any> } = {};

  public static get Instance(): TaskRepository {
    if (TaskRepository.instance == null) {
      TaskRepository.instance = new TaskRepository();
    }
    return TaskRepository.instance;
  }

  getAvailableTasks(): ITask<any>[] {
    return Object.values(this.availableTasks).filter(t => t.Supported);
  }

  register(task: ITask<any>) {
    this.availableTasks[task.Name] = task;
  }
}


TaskRepository.Instance.register(new IndexingTask());
TaskRepository.Instance.register(new DBRestTask());
TaskRepository.Instance.register(new DummyTask());
