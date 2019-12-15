import {ITask} from './tasks/ITask';
import {IndexingTask} from './tasks/IndexingTask';
import {DBRestTask} from './tasks/DBResetTask';
import {VideoConvertingTask} from './tasks/VideoConvertingTask';
import {PhotoConvertingTask} from './tasks/PhotoConvertingTask';

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
TaskRepository.Instance.register(new VideoConvertingTask());
TaskRepository.Instance.register(new PhotoConvertingTask());
