const menu=document.querySelector("#mobile-menu");
const menuLinks=document.querySelector(".nav-menu");

menu.addEventListener("click",()=>{
	menu.classList.toggle("active");
	menuLinks.classList.toggle("active")
})
