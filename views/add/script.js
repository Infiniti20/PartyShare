const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".nav-menu");

menu.addEventListener("click", () => {
	menu.classList.toggle("active");
	menuLinks.classList.toggle("active");
});

document.querySelector(".product-image").addEventListener("click", () => {
	console.log("File opener")
	document.querySelector("input[type=file]").click()
})

document.querySelector("input[type=file]").addEventListener("change", () => {
	const file = document.querySelector('input[type=file]').files[0];
	document.querySelector(".product-image").outerHTML = '<img class="product-image" alt=""/>';

	document.querySelector(".product-image").addEventListener("click", () => {
		document.querySelector("input[type=file]").click()
	})

	let preview = document.querySelector(".product-image");

	const reader = new FileReader();
	reader.addEventListener("load", function () {
		// convert image file to base64 string
		preview.src = reader.result;
	}, false);

	if (file) {
		reader.readAsDataURL(file);
	}
})

document.querySelector(".cost").addEventListener("keydown", function (ev) {
	let self = document.querySelector(".cost")
	let val = self.value
	if (isNaN(parseInt(ev.key)) && ev.key != "." && ev.key.length < 2) { ev.preventDefault() }
	self.value = val.startsWith("$") ? val : "$" + val
})

document.querySelector(".deposit").addEventListener("keydown", function (ev) {
	let self = document.querySelector(".deposit")
	let val = self.value
	if (isNaN(parseInt(ev.key)) && ev.key != "." && ev.key.length < 2) { ev.preventDefault() }
	self.value = val.startsWith("$") ? val : "$" + val
})

document.querySelector("button").addEventListener("click", () => {
	document.querySelector(".overlay").style.display="flex"
	var formElement = document.querySelector("form");
	let children=formElement.children

  let title=document.querySelector(".desktop").value
	let mobileTitle=document.querySelector(".mobile").value

	children[1].value=title==""?mobileTitle:title
	children[2].value=document.querySelector(".cost").value.substring(1)
	children[3].value=document.querySelector(".deposit").value.substring(1)
	children[4].value=name
	children[5].value=document.querySelector(".product-desc").value
	children[6].value=document.querySelector(".about textarea").value
	children[7].value=document.querySelector(".quantity").value
	children[8].value=document.querySelector("select").value
	children[9].value=email


	var formData = new FormData(formElement);
	formData.append("userId",acc)
	var request = new XMLHttpRequest();
	request.open("POST", "api/products/new");
	request.send(formData);
	request.onreadystatechange=()=>{
		if(request.readyState==4){
			location="https://partyshare.infiniti20.repl.co/"
		}
	}
})