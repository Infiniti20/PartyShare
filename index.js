//SQlite databse
const db = require('better-sqlite3')('./database/partyshare.db');
db.pragma('journal_mode = WAL');

//Express
const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

//Libraries
const multer = require('multer')
var admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51IvAvAIgctnHvCgkBvGdXKs5Hloi8nztdxs3VWabhEKvV61Oq03hbYhiIqJUEMmzCVpF7MBROC7yfWoXayNnA9Ci00yms98FUj");
const sharp = require("sharp")
const nodemailer = require("nodemailer")



//Files
const utils = require("./assets/utils")
const caching = require("./assets/cache")
const schedule = require("./assets/schedule")
const dateFunctions = require("./assets/dates")

//Express Setup
const app = express();
app.use(cookieParser())
app.set('view engine', 'ejs');
var body = bodyParser.json()
var url = bodyParser.urlencoded({ extended: true })
app.use('/views', express.static('views'));

//Firebase Storage Setup
admin.initializeApp({
	credential: admin.credential.cert(JSON.parse(process.env.JSON)),
	storageBucket: process.env.BUCKET_URL
});

//Nodemailer Setup
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'googoltechteam@gmail.com',
		pass: process.env.password
	}
});

//Variables
const cache = new caching.Cache()

const upload = multer({ storage: multer.memoryStorage(), fileFilter: utils.filter })
app.locals.bucket = admin.storage().bucket()

const firedb = admin.firestore();


//Reviews are on Google Firebase
//Replit servers are 4 hours ahead
async function persistSchedule() {
	let jobs = await firedb.collection("scheduling").get()
	let obj = {}

	jobs.docs.forEach(doc => {
		obj[doc.id] = doc.data()
	})

	schedule.loadJobs(obj)
	console.log(obj)
}

persistSchedule()

async function addJob(name, func, args, date) {
	await firedb.collection("scheduling").add({
		date: date.getTime(),
		name,
		args,
		passed: false
	})
	schedule.scheduleJob(func, args, date)
}

function sendMail(recipient, subject, text) {
	var mailOptions = {
		from: 'kierankroy2010@gmail.com',
		to: recipient,
		subject,
		html: text
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		}
	});
}

async function editDB(id) {
	await firedb.collection("scheduling").doc(id).set({ passed: true }, { merge: true })
}

schedule.setEditFunction(editDB)
schedule.addAction("createOrder", createOrder)
schedule.addAction("finishOrder", finishOrder)

//HTML Routes
app.get("/", (req, res) => {
	let label = new Date()
	console.time(label)
	let acc = req.cookies.id != undefined
	//Explore cache of first 15 available items
	let explore = cache.get("explore", () => { return db.prepare("SELECT uuid,name,image,cost FROM products").all() }, 900000)
	//Rendering the homepage
	res.render("homepage/index", { products: explore, acc })
	console.log(`GET /`)
	console.timeEnd(label)
	console.log(label)
	console.log("")
})

app.get("/products/:id", async (req, res) => {
	let label = new Date()
	console.time(label)
	let acc = req.cookies.id
	let cachedFireid = cache.exists("fire" + req.params.id)
	//On checkout page sent, delete that key from the cache
	if (cachedFireid == undefined) {
		let dates = await firedb.collection("documents").doc(req.params.id).get()
		cache.set("fire" + req.params.id, dates.data(), 900000)
		cachedFireid = dates.data()
	}
	let product = cache.get(req.params.id, () => { return db.prepare("SELECT * FROM products WHERE uuid = ?").get(req.params.id) }, 900000)
	res.render("products/index", { product: product, dates: cachedFireid, acc: acc })
	console.log(`GET /${req.params.id}`)
	console.timeEnd(label)
	console.log(label)
	console.log("")
})

app.get("/new/products/", (req, res) => {
	let label = new Date()
	console.time(label)
	if (!req.cookies.verify) { res.redirect("/"); return }

	let user = cache.get(req.cookies.id, () => { return db.prepare("SELECT user, password, email FROM users WHERE userId = ?").get(req.cookies.id) }, 900000)
	if (user == undefined) { res.redirect("/"); return }

	if (user.password != req.cookies.verify) { res.send("403 Unauthorized"); return }

	//Rendering the homepage
	res.render("add/index", { acc: req.cookies.id, name: user.user, email: user.email })
	console.log(`GET /add`)
	console.timeEnd(label)
	console.log(label)
	console.log("")
})

app.get("/checkout", async (req, res) => {
	if (!req.cookies["uuid"]) { res.redirect("/"); return }
	let acc = req.cookies["id"]

	const customer = await stripe.customers.create();
	const intent = await stripe.setupIntents.create({
		customer: customer.id,
	});
	res.cookie("customer", customer.id)
	let days = (req.cookies.eDate - req.cookies.sDate) / 86400000


	let product = cache.get(req.cookies.uuid, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(req.cookies.uuid) }, 900000)

	let deposit = product.deposit * req.cookies.quant
	let rentCost = (product.cost * req.cookies.quant) * Math.max(days, 1)

	res.render("checkout/index", { secret: intent.client_secret, acc, cookies: req.cookies, product, total: deposit + rentCost })
})

//API Routes

async function loadFireDataCached(id) {
	let cachedFireid = cache.exists("fire" + id)
	//On checkout page sent, delete that key from the cache
	if (cachedFireid == undefined) {
		let fireQuery = await firedb.collection("documents").doc(id).get()
		cache.set("fire" + id, fireQuery.data(), 900000)
		cachedFireid = fireQuery.data()
	}
	return cachedFireid
}

app.post("/api/order/new", body, async (req, res) => {
	console.log(req.body)
	const paymentMethods = await stripe.paymentMethods.list({
		customer: req.body.customer,
		type: 'card',
	});
	let card = paymentMethods.data[0].id;
	let customerId = req.body.customer;

	let start = parseInt(req.body.cookies.sDate)
	let end = parseInt(req.body.cookies.eDate)
	let quant = req.body.cookies.quant
	let id = req.body.cookies.uuid


	let product = cache.get(req.body.cookies.uuid, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(req.body.cookies.uuid) }, 900000)

	let account = cache.get(product.userId, () => { return db.prepare("SELECT * FROM users WHERE userId = ?").get(product.userId) }, 900000)

	let dates = await loadFireDataCached(id)
	let updatedDates = dateFunctions.updateDates(dates, start, end, quant, product.quantity)
	console.log([dates, start, end, quant, product.quant], updatedDates)
	await firedb.collection("documents").doc(id).set(updatedDates, { merge: true })

	cache.del("fire" + id)



	let confirm = await utils.getFileStream("views/templates/location.html")

	sendMail(req.body.email, "Order Confirmation", utils.replaceValues(confirm, {
		USER: req.body.name,
		EMAIL: account.email,
		DATE: new Date(start).toDateString(),
		ADDRESS: account.location
	}))



	//TODO: ADD ASYNC CACHE FUNC IN UTILS
	let order = await utils.getFileStream("views/templates/order.html")


	sendMail(account.email, "New Order", utils.replaceValues(order, {
		USER: account.user,
		EMAIL: req.body.email,
		ITEM: product.name,
		QUANT: quant,
		DATE: new Date(start).toDateString(),
		DATE2: new Date(end).toDateString()
	}))

	addJob("createOrder", createOrder, [product.uuid, { email: req.body.email, startDate: start, endDate: end, quant, name: req.body.name, }, { customer: customerId, card }], new Date(start - 86400000))

	res.send("")
})
// orderInfo : {
// 	email: string,
//  name: string,
// 	startDate: int,
// 	endDate: int, 
// 	quant: int
// }

// paymentInfo : {
// 	total: int,
// 	fee: int,
// 	customer: userId,
// 	card: object
// }

async function createOrder(productId, orderInfo, paymentInfo, ) {

	let product = cache.get(productId, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(productId) }, 900000)

	let account = cache.get(product.userId, () => { return db.prepare("SELECT * from users WHERE userId = ?").get(product.userId) }, 900000)

	let days = (orderInfo.startDate - orderInfo.endDate) / 86400000
	let deposit = product.deposit * orderInfo.quant
	let rentCost = (product.cost * orderInfo.quant) * Math.max(days, 1)

	let total = deposit + rentCost

	let percentage = (total / 100) * 10

	let cusOrder = await utils.getFileStream("views/templates/order.html")


	sendMail(orderInfo.email, "Order Pickup", utils.replaceValues(cusOrder, {
		USER: orderInfo.name,
		EMAIL: account.email,
		ADDRESS: account.location
	}))

	let vendorOrder = await utils.getFileStream("views/templates/order.html")


	sendMail(account.email, "Order Pickup", utils.replaceValues(vendorOrder, {
		USER: account.user,
		CUSTOMER: orderInfo.name,
		ITEM: product.name,
		QUANT: orderInfo.quant,
		DATE: new Date(orderInfo.startDate).toDateString(),
		DATE2: new Date(orderInfo.endDate).toDateString()
	}))

	const paymentIntent = await stripe.paymentIntents.create({
		amount: total * 100,
		currency: 'cad',
		customer: paymentInfo.customer,
		payment_method: paymentInfo.card,
		application_fee_amount: percentage * 100,
		off_session: true,
		confirm: true,
		transfer_data: {
			destination: product.userId
		}
	});

	let emailInfo = {
		customer: orderInfo.email,
		vendor: account.email
	}
	let payments = {
		intentId: paymentIntent.id,
		deposit,
		name: orderInfo.name,
		product: product.name
	}
	addJob("finishOrder", finishOrder, [payments, emailInfo, account], new Date(orderInfo.endDate + 86400000))

}

async function finishOrder(paymentInfo, emailInfo, account) {
	await firedb.collection("payments").doc(paymentInfo.intentId).set({
		amount: paymentInfo.deposit,
		customerEmail: emailInfo.customer,
		account: account.userId
	})
	let deposit = await utils.getFileStream("views/templates/deposit.html")

	//Send email using deposit refund
	sendMail(emailInfo.vendor, "Refund Deposit", utils.replaceValues(deposit, {
		USER: account.name,
		ITEM: paymentInfo.product,
		CUSTOMER: paymentInfo.name,
		DEP_LINK: "https://partyshare.infiniti20.repl.co/refund/deposit/" + paymentInfo.intentId
	}))
}

app.get("/refund/deposit/:id", async (req, res) => {
	let data = await firedb.collection("payments").doc(req.params.id).get();

	if (req.cookies.id != data.account) { res.send("Sorry, your account is not authorized to refund this deposit. Are you signed in with the right account?"); return }

})


app.post("/api/products/new", body, upload.single('product-image'), async (req, res) => {
	let ext = utils.getExt(req.file.originalname)
	let name = utils.computeHash(req.file.originalname + Math.random()) + ext
	name = name.replace(/\//g, "|")

	let uuid = utils.generateUUID()
	let sharpFile = await sharp(req.file.buffer).resize({ width: 350, height: 350 }).jpeg({
		quality: 70
	}).toBuffer()

	//Insert into DB next
	await app.locals.bucket.file(name).createWriteStream().end(sharpFile)

	//validate before this statement, because we use a cookie, so we need to make sure the statement is safe
	db.prepare(`INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?,?,null,?,?)`).run(
		req.body.userId,
		req.body.seller,
		req.body.email,
		uuid,
		name,
		req.body.title,
		req.body.desc,
		parseInt(req.body.quantity),
		req.body.category,
		parseInt(req.body.cost).toFixed(2),
		req.body.info,
		parseInt(req.body.deposit).toFixed(2)
	)
	cache.del("explore")
	await firedb.collection("documents").doc(uuid).set({
		"1263310860": 1
	})
	cache.set("fire" + uuid, { "1263310860": 1 }, 900000)
	res.json({ status: "200 OK" })

})

app.post("/api/users/new", url, (req, res) => {
	db.prepare("INSERT INTO users VALUES(?,?,?,?,?)").run(
		req.cookies.stripeId,
		req.body.name,
		utils.computeHash(req.body.password),
		req.body.email,
		`${req.body.address}, ${req.body.city}, Ontario`
	)
	res.cookie("id", req.cookies.stripeId, { maxAge: 1814000000 })
	res.cookie("verify", utils.computeHash(req.body.password), { maxAge: 1814000000 })
	res.clearCookie("stripeId")
	res.redirect("https://partyshare.infiniti20.repl.co")
})


//Stripe Routes

app.get("/new/accounts/", async (req, res) => {
	const account = await stripe.accounts.create({
		type: 'express',
		country: 'CA',
		business_type: "individual"
	});
	const accountLinks = await stripe.accountLinks.create({
		account: account.id,
		refresh_url: 'https://partyshare.infiniti20.repl.co/new/accounts',
		return_url: 'https://partyshare.infiniti20.repl.co/new/accounts/submit',
		type: 'account_onboarding',
	});
	res.cookie("stripeId", account.id)
	res.redirect(accountLinks.url);
})

app.get("/new/accounts/submit", async (req, res) => {
	let stripeId = req.cookies["stripeId"]
	res.render("form/index.ejs")
})

// app.post("/:id/rent/date")

app.listen(3000, () => { console.log("Server running..."); console.log("") })
