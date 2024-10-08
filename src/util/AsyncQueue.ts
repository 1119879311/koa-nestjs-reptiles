class AsyncTask {
  id: any;
  priority: any;
  taskFunction: any;
  isAborted: boolean;
  isRunning: boolean;
  constructor(id, priority, taskFunction) {
    this.id = id || "TASK_" + Math.random().toString().replace("0.",'');
    this.priority = priority;
    this.taskFunction = taskFunction;
    this.isAborted = false;
    this.isRunning = false;
  }

  run() {
    return new Promise((resolve, reject) => {
      if (this.isAborted) {
        reject('Task was aborted before starting.');
        return;
      }
      this.isRunning = true;
      try {
        // 如果taskFunction是异步函数或返回一个Promise，它将被等待
        Promise.resolve(this.taskFunction())
          .then(result => {
            if (!this.isAborted) {
              resolve(result);
            } else {
              reject('Task was aborted.');
            }
          })
          .catch(reject)
          .finally(() => {
            this.isRunning = false;
          });
      } catch (error) {
        reject(error);
        this.isRunning = false;
      }
    });
  }

  abort() {
    if (this.isRunning) {
      this.isAborted = true; // 设置中止标志，如果任务正在运行
    }
  }
}

type ItaskRunCallbak = (option:{success:boolean,id:string|number,priority: string|number | undefined |null, data:any})=>void |null

export class AsyncPriorityQueue {
  concurrency: any;
  interval: any;
  bufferTime: any;
  taskQueue: any[];
  runningTasks: Map<any, any>;
  intervalTimer: any;
  bufferTimer: any;
  lastTaskTime: number;
  // successCallback: any;
  // errorCallback: any;
  taskRunCallbak:ItaskRunCallbak
  // finshCallback:any
  constructor(concurrency?, interval?, bufferTime?) {
    this.concurrency = concurrency || null; // 并发数量限制
    this.interval = interval || null;       // 任务之间的间隔时间
    this.bufferTime = bufferTime || 0;    // 用于收集任务的缓冲时间，默认500毫秒
    this.taskQueue = [];                    // 待执行的任务队列
    this.runningTasks = new Map();          // 当前正在执行的任务映射
    this.intervalTimer = null;              // 间隔定时器
    this.bufferTimer = null;                // 缓冲定时器
    this.lastTaskTime = Date.now();         // 最后一个任务加入的时间

    // this.successCallback = null;
    // this.errorCallback = null;
    this.taskRunCallbak = null
    // this.finshCallback = null

  }

  addTask(taskFunction, priority?, id?) {
    const task = new AsyncTask(id, priority, taskFunction);
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => a.priority - b.priority);

    this.lastTaskTime = Date.now(); // 更新最后一个任务的加入时间
    this.startBufferTimer();
    return task.id
  }

  onTaskRun(taskRunCallbak:ItaskRunCallbak) {
    this.taskRunCallbak = taskRunCallbak;
    // this.successCallback = successCallback;
    // this.errorCallback = errorCallback;
  }

  // onTaskFinsh(callback){
  //   this.finshCallback = callback
  // }

  startBufferTimer() {
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer); // 如果已经有定时器，先清除
    }
    this.bufferTimer = setTimeout(() => {
      // 检查是否在缓冲时间内有新任务加入

      if ((Date.now() - this.lastTaskTime) >= this.bufferTime) {
        this.processQueue(); // 缓冲时间结束且没有新任务加入，处理队列
      } else {
        this.startBufferTimer(); // 有新任务加入，重新设置缓冲定时器
      }
    }, this.bufferTime);
  }

  abortTask(taskId) {
    const task = this.runningTasks.get(taskId) || this.taskQueue.find(t => t.id === taskId);

    if (task) {
      task.abort();

      if (!task.isRunning) {
        // 如果任务还没有开始运行，直接从队列中移除
        this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);

      }
    }
  }

  // 启动任务的方法
  processQueue() {
    // 如果有间隔定时器在运行，则不启动新任务
    if (this.intervalTimer) return;
    // console.log("队列数据", queue.taskQueue.length, queue.runningTasks.size)
    // 如果设置了并发限制，且当前运行任务数达到限制，则不启动新任务
    // console.log("1212", this.concurrency, this.concurrency, this.runningTasks.size)
    if (this.concurrency !== null && this.runningTasks.size >= this.concurrency) return;

    // 启动任务直至达到并发数限制或没有更多任务
    while (this.taskQueue.length > 0 && (this.concurrency === null || this.runningTasks.size < this.concurrency)) {
      // 从队列中取出任务
      const nextTask = this.taskQueue.shift();
      // 记录任务为正在运行
      this.runningTasks.set(nextTask.id, nextTask);
      // 运行任务
      nextTask.run().then((res) => {
        // 移除完成的任务
        // this.runningTasks.delete(nextTask.id);
        // this.successCallback?.({ id: nextTask.id, priority: nextTask.priority, data: res })
        // this.finshTask()
        this.completeTask(nextTask,true,res);
      }).catch((error) => {
        // 移除完成的任务
        // this.runningTasks.delete(nextTask.id);
        // this.errorCallback?.({ id: nextTask.id, priority: nextTask.priority, error })
        // this.finshTask()
        this.completeTask(nextTask,false,error);
      });
    }
  }

  // private finshTask(){
  //     if(this.isFinsh() && typeof this.finshCallback==="function"){
  //         this.finshCallback()
  //     }

  // }
  // 任务完成后的处理
  completeTask(nextTask,isSuccess,data) {
    this.runningTasks.delete(nextTask.id);
    this.taskRunCallbak?.({success:isSuccess,id:nextTask.id,priority: nextTask.priority, data})
    // if(isSuccess){
    //   this.successCallback?.({ id: nextTask.id, priority: nextTask.priority, data })
    // }else{
    //   this.errorCallback?.({ id: nextTask.id, priority: nextTask.priority, error:data })
    // }
    // this.finshTask()

    // 如果还有任务在队列中，且没有正在执行的任务
    if (this.taskQueue.length > 0 && this.runningTasks.size === 0) {
      // 如果设置了间隔时间，则等待间隔后再次处理队列
      if (this.interval !== null) {
        this.intervalTimer = setTimeout(() => {
          this.intervalTimer = null;
          this.processQueue();
        }, this.interval);
      } else {
        // 如果没有设置间隔，立即处理队列
        this.processQueue();
      }
    }
  }

  isFinsh() {
    return this.getQueueSize() ===0;
  }

  getQueueSize(){
    return this.taskQueue.length + this.runningTasks.size 
  }
  //清空任务(只终止没执行)
  clear() {
    this.taskQueue = [];
    [...this.runningTasks.values()].forEach(task => task.abort())
  }
}




// class Upload {
//   constructor(sizes = 10000) {
//     this.queue = new AsyncPriorityQueue(6);

//     this.queue.onTaskRun(
//       (result) => {

//         console.log("success-callback:", result.id, this.queue.taskQueue.length, this.queue.isFinsh())

//       }, (error) => {
//         console.log("error-callback:", error, this.queue.taskQueue.length)
//       })
//     this.init(sizes)

//   }


//   init(sizes) {
//     let itemSize = 100;

//     this.times = Math.ceil(sizes / itemSize)

//     this.batchTask(this.times, itemSize)
//   }

//   batchTask(times, itemSize) {

//     for (let index = 0; index < times; index++) {
//       let id = `${index}-${Math.random()}`
//       this.queue.addTask(() => this.requst(id, itemSize), 0, id);
//     }
//     console.log("新增-", times, this.queue.taskQueue.length)
//   }

//   async requst(id) {

//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(id);
//         // this.requst(Math.random(),100)
//         if (!this.stop) {
//           if (this.queue.taskQueue.length < 100) {
//             this.batchTask(20, 100)
//           } else {
//             this.stop = true;
//           }
//         }

//       }, Math.floor(1000 + Math.random() * 5000));
//     });

//   }

// }

// new Upload()

