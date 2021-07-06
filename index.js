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


//Files
const utils = require("./assets/utils")
const caching = require("./assets/cache")


//Express Setup
const app = express();
app.use(cookieParser())
app.set('view engine', 'ejs');
var body = bodyParser.json()
var url = express.urlencoded({ extended: true })
app.use('/views', express.static('views'));

//Firebase Storage Setup
admin.initializeApp({
	credential: admin.credential.cert(JSON.parse(process.env.JSON)),
	storageBucket: process.env.BUCKET_URL
});



//Variables
const cache = new caching.Cache()

const upload = multer({ storage: multer.memoryStorage(), fileFilter: utils.filter })
app.locals.bucket = admin.storage().bucket()

const firedb = admin.firestore();


//Reviews are on Google Firebase
//Replit servers are 4 hours ahead


//HTML Routes
app.get("/", (req, res) => {
	console.time()

	//Explore cache of first 15 available items
	let explore = cache.get("explore", () => { return db.prepare("SELECT uuid,name,image,cost FROM products").all() }, 900000)
	//Rendering the homepage
	res.render("homepage/index", { products: explore })
	console.log(`GET /`)
	console.timeEnd()
	console.log(new Date())
	console.log("")
})

app.get("/products/:id", async (req, res) => {
	console.time()
	let cachedFireid = cache.exists("fire" + req.params.id)
	//On checkout page sent, delete that key from the cache
	if (cachedFireid == undefined) {
		let dates = await firedb.collection("documents").doc(req.params.id).get()
		cache.set("fire" + req.params.id, dates.data(), 900000)
		cachedFireid = dates.data()
	}
	let product = cache.get(req.params.id, () => { return db.prepare("SELECT * FROM products WHERE uuid = ?").get(req.params.id) }, 900000)
	res.render("products/index", { product: product, dates: cachedFireid, acc: "hi" })
	console.log(`GET /${req.params.id}`)
	console.timeEnd()
	console.log(new Date())
	console.log("")
})

app.get("/add", (req, res) => {
	console.time()
	let user = db.prepare("SELECT user, password, email FROM users WHERE userId = ?").get(req.cookies.id)

	if (user.password != req.cookies.verify) { res.send("403 Unauthorized"); return }

	//Rendering the homepage
	res.render("add/index", { acc: req.cookies.id, name: user.user, email: user.email })
	console.log(`GET /add`)
	console.timeEnd()
	console.log(new Date())
	console.log("")
})

app.get("/checkout", async (req, res) => {
	if (!req.cookies["uuid"]) { res.redirect("/"); return }
	let product = cache.get(req.params.id, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(req.cookies.uuid) }, 900000)
	res.send("403")
})

//API Routes

app.get("/api/products/:category", (req, res) => {
	console.time()
	let productMetadata = cache.get(req.params.id, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(req.params.id) }, 900000)
	res.send(productMetadata)
	console.log(`GET ${req.params.id}`)
	console.timeEnd()
	console.log(new Date())
	console.log("")
})



app.post("/api/products/new", body, upload.single('product-image'), async (req, res) => {
	let ext = utils.getExt(req.file.originalname)
	let name = utils.computeHash(req.file.originalname + Math.random()) + ext
	name = name.replace(/\//g, "|")

	let uuid = utils.generateUUID()
	//Insert into DB next
	await app.locals.bucket.file(name).createWriteStream().end(req.file.buffer)

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
	res.json({ status: "200 OK" })

})

app.post("/api/users/new", url, (req, res) => {
	db.prepare("INSERT INTO users VALUES(?,?,?,?)").run(
		req.cookies.stripeId,
		req.body.name,
		utils.computeHash(req.body.password),
		req.body.email
	)
	res.cookie("id", req.cookies.stripeId)
	res.cookie("verify", utils.computeHash(req.body.password))
	res.clearCookie("stripeId")
	res.redirect("https://partyshare.infiniti20.repl.co")
})


//Stripe Routes

app.get("/create", async (req, res) => {
	const account = await stripe.accounts.create({
		type: 'express',
		country: 'CA',
		business_profile: {
			product_description: "One of PartyShare's Lessors."
		}
	});
	const accountLinks = await stripe.accountLinks.create({
		account: account.id,
		refresh_url: 'https://partyshare.infiniti20.repl.co/create',
		return_url: 'https://partyshare.infiniti20.repl.co/collect',
		type: 'account_onboarding',
	});
	res.cookie("stripeId", account.id)
	res.redirect(accountLinks.url);
})

app.get("/collect", async (req, res) => {
	let stripeId = req.cookies["stripeId"]
	res.render("form/index.ejs")
})

// app.post("/:id/rent/date")

app.listen(3000, () => { console.log("Server running..."); console.log("") })
