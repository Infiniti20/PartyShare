const lt = require('long-timeout')
let actions = {}

function addAction(name, action) {
	actions[name] = action
}

function scheduleJob(func, args, date) {
	let delay = calculateDelay(date);
	lt.setTimeout(()=>{func(...args)}, delay)
}

function loadJobs(jobs) {
	let date = new Date().getTime()
	for (let i = 0; i < jobs.length; i++) {
		let job = jobs[i]
		if (date > job.date) { continue }
    // console.log("Iter: ", `${i} - ${job.date}`, "\nCurrent date: ", new Date().toDateString()+"\n" + new Date().toTimeString(),"\nJob date: ", new Date(job.date).toDateString() +"\n" + new Date(job.date).toTimeString());
		scheduleJob(actions[job.func], job.args, new Date(job.date))
	}
}

function calculateDelay(targetDate) {
	let unixTargetDate = targetDate.getTime()
	let unixDate = new Date().getTime()

	let delay = Math.max((unixTargetDate - unixDate), 0)

	return delay
}

module.exports = { addAction, loadJobs, scheduleJob }