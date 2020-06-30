/**
 * Type Definition of Task Callback aka Job that needs to be executed
 */
export type TaskCallback = () => void;
/**
 * Faster setTimeout(fn, 0) implementation using postMessage API
 * Based on https://dbaron.org/log/20100309-faster-timeouts
 */
export class TaskScheduler {
  /**
   * Message used to check for Arduino task
   */
  readonly messageName = 'arduinoRocks';

  /**
   * Queue to store Task (JOB)
   */
  private Queue: Array<TaskCallback> = [];
  /**
   * Store the state of queue
   */
  private stopped = true;

  /**
   * Start The Scheduler
   */
  start() {
    // If it is on Stop State then start
    if (this.stopped) {
      this.stopped = false;
      window.addEventListener('message', this.handleMessage, true);
    }
  }
  /**
   * Stop The Scheduler
   */
  stop() {
    this.stopped = true;
    window.removeEventListener('message', this.handleMessage, true);
  }
  /**
   * Add task to the Scheduler
   * @param fn The Task that needs to complete
   */
  postTask(fn: TaskCallback) {
    // if it is stop then don't add to queue
    if (!this.stopped) {
      this.Queue.push(fn);
      window.postMessage(this.messageName, '*');
    }
  }
  /**
   * Message Event Listener
   * @param event Message Event
   */
  private handleMessage = (event: MessageEvent) => {
    // Only Process Arduino Task and ignore others
    if (event.data === this.messageName) {
      // Prevents further propagation of the current event
      event.stopPropagation();
      // Takes the Task (job) from queue and execute it
      const executeJob = this.Queue.shift();
      if (executeJob !== undefined) {
        executeJob();
      }
    }
  }
}
