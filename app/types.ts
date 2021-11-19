interface order {
	paymentId: string,
	productId: string,
	accountId: string,
	customer: customer,
	amount: number,
	dateReturned: number
}

interface account {
	id: string,
	name: string
	email: string,
	authID: string,
	location: string,
}

interface customer {
	name: string,
	id: string,
	email: string
}

interface product {
	name: string,
	id: string,
	accountID: string,
	imageURL: string,
	category: "Decor" | "Centerpieces" | "Dining" | "Other",
	desc: string,
	info: string,
	quantity: number,
	price: number,
}


export {order, account, customer, product}