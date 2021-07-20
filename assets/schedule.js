const lt = require('long-timeout')
let actions = {}

function addAction(name, action) {
	actions[name] = action
}

function scheduleJob(func, args, date) {
	let delay = calculateDelay(date);
	lt.setTimeout(() => { func(...args) }, delay)
}

function loadJobs(jobs) {
	let date = new Date().getTime()
	ids = Object.keys(jobs)
	jobs = Object.values(jobs)
	for (let i = 0; i < jobs.length; i++) {
		let job = jobs[i]
		if (date > job.date) {
			if (job.passed == false) { actions[job.func](...job.args); actions["edit"](ids[i]) }
			continue
		}
		scheduleJob(actions[job.func], job.args, new Date(job.date))
	}
}

function setEditFunction(func) {
	actions["edit"] = func
}

function calculateDelay(targetDate) {
	let unixTargetDate = targetDate.getTime()
	let unixDate = new Date().getTime()

	let delay = Math.max((unixTargetDate - unixDate), 0)

	return delay
}

module.exports = { addAction, loadJobs, scheduleJob, setEditFunction }