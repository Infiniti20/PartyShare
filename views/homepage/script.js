document.querySelectorAll(".product").forEach(product=>{
	product.addEventListener("click",()=>{
		location="/products/"+product.id
	})
})
