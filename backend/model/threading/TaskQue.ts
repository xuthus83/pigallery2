import {Utils} from '../../../common/Utils';


export interface TaskQueEntry<I, O> {
  data: I;
  promise: { obj: Promise<O>, resolve: Function, reject: Function };
}


export class TaskQue<I, O> {

  private tasks: TaskQueEntry<I, O>[] = [];
  private processing: TaskQueEntry<I, O>[] = [];

  constructor() {
  }


  private getSameTask(input: I): TaskQueEntry<I, O> {
    return this.tasks.find(t => Utils.equalsFilter(t.data, input)) ||
      this.processing.find(t => Utils.equalsFilter(t.data, input));
  }

  private putNewTask(input: I): TaskQueEntry<I, O> {
    const taskEntry: TaskQueEntry<I, O> = {
      data: input,
      promise: {
        obj: null,
        resolve: null,
        reject: null
      }
    };
    this.tasks.push(taskEntry);
    taskEntry.promise.obj = new Promise<O>((resolve: Function, reject: Function) => {
      taskEntry.promise.reject = reject;
      taskEntry.promise.resolve = resolve;
    });
    return taskEntry;
  }

  public isEmpty(): boolean {
    return this.tasks.length === 0;
  }

  public add(input: I): TaskQueEntry<I, O> {
    return (this.getSameTask(input) || this.putNewTask(input));
  }

  public get(): TaskQueEntry<I, O> {
    const task = this.tasks.shift();
    this.processing.push(task);
    return task;
  }

  public ready(task: TaskQueEntry<I, O>): void {
    this.processing.slice(this.processing.indexOf(task), 1);
  }
}
