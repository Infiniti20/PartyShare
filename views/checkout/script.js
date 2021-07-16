const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".nav-menu");

menu.addEventListener("click", () => {
	menu.classList.toggle("active");
	menuLinks.classList.toggle("active")
})


let stripe = Stripe('pk_test_51IvAvAIgctnHvCgkpz5WJ6iAv3OR8sSZG2saPWfDQX8m7RMX6GmaBVa5rD5aFAphPpghJ0dHvkZJuCSBPqedEkIB00MWDTIsDN');

let elements = stripe.elements();
let style = {
	base: {
		color: "#32325d",
		fontFamily: 'monospace',
		fontSmoothing: "antialiased",
		fontSize: "16px",
		"::placeholder": {
			color: "#32325d"
		}
	},
	invalid: {
		fontFamily: 'monospace',
		color: "#f64747",
		iconColor: "#f64747"
	}
};
let card = elements.create("card", { style: style });
// Stripe injects an iframe into the DOM
card.mount("#card-element");
card.on("change", function (event) {
	// Disable the Pay button if there are no card details in the Element
	document.querySelector("button").disabled = event.empty;

	document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
});

let setupForm = document.getElementById('payment-form');
let clientSecret = setupForm.dataset.secret;


setupForm.addEventListener('submit', async function (ev) {
	let name = document.getElementById("name").value;
	let email = document.getElementById("email").value;
	ev.preventDefault();
	loading(true)
	if (!name || !email) { showError("Name and Email are required."); return }
	let result = await stripe.confirmCardSetup(
		clientSecret,
		{
			payment_method: {
				card: card,
				billing_details: {
					name: name,
				},
			},
		}
	)
	loading(false)
	if (result.error) {
		showError(result.error.message)
	} else {
		loading(false)
		let res = await fetch("/api/order/new", {
			method: "POST",
			body: JSON.stringify({ customer: cookies.customer, cookies: cookies, email, name }),
			headers: {
				"Content-Type": "application/json"
			},
			credentials:'include',
		})

	}
});

function loading(isLoading) {
	if (isLoading) {
		// Disable the button and show a spinner
		document.querySelector("button").disabled = true;
		document.querySelector("#spinner").classList.remove("hidden");
		document.querySelector("#button-text").classList.add("hidden");
	} else {
		document.querySelector("button").disabled = false;
		document.querySelector("#spinner").classList.add("hidden");
		document.querySelector("#button-text").classList.remove("hidden");
	}
};

function showError(errorMsgText) {
	loading(false)
	let errorMsg = document.querySelector("#card-error");
	errorMsg.textContent = errorMsgText;
	setTimeout(function () {
		errorMsg.textContent = "";
	}, 4000);
};