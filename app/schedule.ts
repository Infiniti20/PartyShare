import lt from "long-timeout";

let actions: { [action: string]: Function } = {};

interface Job {
  date: number;
  name: string;
  args: any[];
  passed: boolean;
}

function addAction(name: string, action: Function): Function {
  actions[name] = action;
  return action;
}

function addEditAction(func: Function): Function {
  actions["edit"] = func;
  return func;
}

function scheduleJob(func: Function, args: any[], date: Date) {
  let delay = calculateDelay(date);
  lt.setTimeout(() => {
    console.log("executed");
    func(...args);
  }, delay);
}

function calculateDelay(targetDate: Date): number {
  let unixTargetDate = targetDate.getTime();
  let unixDate = new Date().getTime();

  let delay = Math.max(unixTargetDate - unixDate, 0);

  return delay;
}

async function loadJobs(jobs: { [job: string]: Job }) {
  let date = new Date().getTime();
  let ids = Object.keys(jobs);
  const jobList = Object.values(jobs);

  for (let i = 0; i < jobList.length; i++) {
    let job = jobList[i];
    if (date > job.date) {
      if (job.passed == false) {
        actions[job.name](...job.args);
        await actions["edit"](ids[i]);
      }
      continue;
    }

    scheduleJob(actions[job.name], job.args, new Date(job.date));
  }
}

export { addAction, addEditAction, loadJobs, scheduleJob, Job };
