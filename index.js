//SQlite databse
const db = require('better-sqlite3')('./database/partyshare.db');
db.pragma('journal_mode = WAL');

//Express
const cors = require('cors');
const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

//Libraries
const multer = require('multer')
var admin = require("firebase-admin");
const stripe = require("stripe")(process.env.stripeSK);


//Files
const utils = require("./assets/utils")
const caching = require("./assets/cache")


//Express Setup
const app = express();
app.use(cors());
app.use(cookieParser())
app.set('view engine', 'ejs');
app.options('*', cors());
var body = bodyParser.json()
app.use('/views', express.static('views'));

//Firebase Storage Setup
admin.initializeApp({
	credential: admin.credential.cert(JSON.parse(process.env.JSON)),
	storageBucket: process.env.BUCKET_URL
});

//c4eeb4f2-1912-484af-9e5-1 product Id

//Variables
const cache = new caching.Cache()
const upload = multer({ storage: multer.memoryStorage(), fileFilter: utils.filter })
app.locals.bucket = admin.storage().bucket()


//HTML Routes
app.get("/", (req, res) => {
	let account = req.cookies.token || undefined;
	res.send(`Unfinished`)
})
app.get("/checkout/:id",(req,res)=>{
	res.render("checkout/index")
})

//API Routes

//GET Routes
app.get("/api/products/:id/", (req, res) => {
	console.time()
	let productMetadata = cache.get(req.params.id, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(req.params.id) },900000)
	res.send(productMetadata)
	console.log(`GET ${req.params.id}`)
	console.timeEnd()
	console.log("")
})


//POST Routes
app.post("/api/products/:id/update/details", body, (req, res) => {
	db.prepare("UPDATE products SET name = ?, desc = ?, image = ? WHERE uuid = ?").run(req.body.name, req.body.desc, req.body.image, req.params.id)
})

app.post("/api/products/:id/update/pricing", body, (req, res) => {
	db.prepare("UPDATE products SET cost = ?, quantity = ? WHERE uuid = ?").run(req.body.cost, req.body.quantity, req.params.id)
})

app.post("/api/products/new", body, upload.single('profile_pic'), async (req, res) => {
	let ext = utils.getExt(req.file.originalname)
	let name = utils.computeHash(req.file.originalname + Math.random()) + ext
	//Insert into DB next
	await app.locals.bucket.file(name).createWriteStream().end(req.file.buffer)
	res.json({ status: "200 OK" })
})


app.listen(3000, () => { console.log("Server running...");console.log("")})
