class ThrottleTask {
  constructor(amount, delay) {
    this.amount = amount;
    this.delay = delay;
    this.tasks = [];
    this.iterator = 0;
  }

  set delay = delay => {this.delay = delay; }

  add = task => {
     this.tasks.push(task);
  }

  run = () => {  
    this.tasks
  }
}