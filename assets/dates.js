function createDateRange(start, end) {
	let dateRange = [];
	let day = start;
	if (end == start) { return [start] }
	end -= 86400000
	while (day != end) {
		day += 86400000
		dateRange.push(day)
	}
	return [start, ...dateRange, end += 86400000];
}

// let startDate = new Date(document.querySelector("#start").value).setHours(0, 0, 0, 0);
// let quant = document.querySelector("#quant").value
// let endDate = new Date(document.querySelector("#end").value).setHours(0, 0, 0, 0);

function updateDates(dates, startDate, endDate, quant, totalQuant) {
	let keys = Object.keys(dates);
	let inRange = keys.filter(date => {
		return date >= startDate && date <= endDate
	})
	let quants = inRange.map(e => dates[e.toString()])
	keys = createDateRange(startDate, endDate)
	if (quants.some(e => e - quant > 0) || quants.length < 1) {
		for (let i = 0; i < keys.length; i++) {
			if (dates[keys[i]]) {
				dates[keys[i]] -= quant
			} else {
				dates[keys[i]] = totalQuant - quant
			}
		}
		let returnDate = endDate + 86400000
		if (dates[returnDate]) {
			dates[returnDate] += quant
		} else {
			dates[returnDate] = totalQuant
		}
		return dates
	}
}

module.exports = {
	createDateRange,
	updateDates
}