interface order {
	paymentId: string,
	productId: string,
	account: account,
	customer: customer,
	amount: number,
	date: number
}

interface account {
	id: string,
	name: string
	password: string,
	location: string,
	email: string
}

interface customer {
	name: string,
	id: string,
	email: string
}

interface product {
	name: string,
	id: string,
	accountId: string,
	imageURL: string,
	category: "Decor" | "Centerpieces" | "Dining" | "Other",
	desc: string,
	info: string,
	quantity: number,
	price: number,
	deposit: number,
}

export {order, account, customer, product}