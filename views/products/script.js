const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".nav-menu");

menu.addEventListener("click", () => {
	menu.classList.toggle("active");
	menuLinks.classList.toggle("active");
});

function createDropDown(int) {
	let str = "";
	for (let i = 1; i <= int; i++) {
		str += `<option value="${i}">${i}</option>`;
	}
	return str;
}

function createDateRange(start, end) {
	let dateRange = [];
	let day = start;
	if(end==start){return [start]}
	end -= 86400000
	while (day != end) {
		day += 86400000
		dateRange.push(day)
	}
	return [start, ...dateRange, end += 86400000];
}

flatpickr(".date", {
	monthSelectorType: "static",
	minDate: "today",
	dateFormat: "Y/m/d",
	altFormat: "Y/d/m",
	disableMobile: true,
	altInput: true,
});

document.querySelector(".buy-card button").addEventListener("click", () => {
	let startDate = new Date(document.querySelector("#start").value).setHours(0, 0, 0, 0);
	let quant = document.querySelector("#quant").value
	let endDate = new Date(document.querySelector("#end").value).setHours(0, 0, 0, 0);
	console.log(endDate, startDate);
	let keys = Object.keys(dates);
	let inRange = keys.filter(date => {
		return date >= startDate && date <= endDate
	})
	let quants = inRange.map(e => dates[e.toString()])
	keys = createDateRange(startDate, endDate)
	console.log(keys)
	if (quants.some(e => e - quant > -1) || quants.length < 1) {
		for (let i = 0; i < keys.length; i++) {
			console.log(new Date(keys[i]).toDateString(), dates[keys[i]])
			if (dates[keys[i]]) {
				dates[keys[i]] -= quant
			} else {
				dates[keys[i]] = product.quantity - quant
			}
		}
		let returnDate = endDate + 86400000
		if (dates[returnDate]) {
			dates[returnDate] += quant
		} else {
			dates[returnDate] = product.quantity
		}
		console.log(dates)
		cookie.set({ uuid: product.uuid, quant: quant, sDate: startDate, eDate: endDate },{path:"/checkout"})
		location.href="/checkout"
	}

});

document.querySelectorAll(".date").forEach(ele => {
	ele.addEventListener("change", () => {
		let startDate = new Date(document.querySelector("#start").value).setHours(0, 0, 0, 0);
		let endDate = new Date(document.querySelector("#end").value).setHours(0, 0, 0, 0);
		let quant = document.querySelector("#quant")
		console.log(endDate, startDate);
		if (startDate && endDate) {
			let keys = Object.keys(dates);
			let inRange = keys.filter(date => {
				return date >= startDate && date <= endDate
			})
			let quants = inRange.map(e => dates[e.toString()])
			let max = quants.sort(function (a, b) { return a - b })[0]
			max = max == undefined ? product.quantity : max
			quant.innerHTML = createDropDown(max)
		}

	})
})


// document.body.addEventListener('change', function (evt) {
// 		 	let quant=document.querySelector("#quant")
// 			quant.innerHTML=createDropDown(4)
// });