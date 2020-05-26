export type TaskCallback = () => void;
export class TaskScheduler {
  readonly messageName = 'arduinoRocks';
  private Queue: Array<TaskCallback> = [];
  private stopped = true;

  start() {
    if (this.stopped) {
      this.stopped = false;
      window.addEventListener('message', this.handleMessage, true);
    }
  }

  stop() {
    this.stopped = true;
    window.removeEventListener('message', this.handleMessage, true);
  }

  postTask(fn: TaskCallback) {
    if (!this.stopped) {
      this.Queue.push(fn);
      window.postMessage(this.messageName, '*');
    }
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.data === this.messageName) {
      event.stopPropagation();
      const executeJob = this.Queue.shift();
      if (executeJob !== undefined) {
        executeJob();
      }
    }
  }
}
