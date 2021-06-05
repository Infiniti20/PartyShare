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
const stripe = require("stripe")(process.env.stripeSK);


//Files
const utils = require("./assets/utils")
const caching = require("./assets/cache")


//Express Setup
const app = express();
app.use(cookieParser())
app.set('view engine', 'ejs');
var body = bodyParser.json()
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


//Reviews are on Google Firebase
//Replit servers are 4 hours ahead

//HTML Routes
app.get("/", (req, res) => {
	console.time()
	let account = req.cookies.token || undefined;

	//Explore cache of first 15 available items
	let explore=cache.get("explore",()=>{return db.prepare("SELECT * FROM products WHERE returned IS null LIMIT 15").all()},900000)
	//Rendering the homepage
	res.render("homepage/index",{products:explore})
	console.log(`GET /`)
	console.timeEnd()
	console.log(new Date())
	console.log("")
})

app.get("/products/:id",(req,res)=>{
	let product=cache.get(req.params.id,()=>{return db.prepare("SELECT * FROM products WHERE uuid = ?").get(req.params.id)},900000)
	res.render("products/index",{product:product})
})

//Temp path
app.get("/upload",(req,res)=>{
	 res.send(`<form method="POST" action="/api/products/new" enctype="multipart/form-data">
    <div>
        <label>Select your profile picture:</label>
        <input type="file" name="product_image" />
    </div>
    <div>
        <input type="submit" name="btn_upload_profile_pic" value="Upload" />
    </div>
</form>`)
})

//API Routes

//GET Routes
app.get("/api/products/:id/", (req, res) => {
	console.time()
	let productMetadata = cache.get(req.params.id, () => { return db.prepare("SELECT * from products WHERE uuid = ?").get(req.params.id) },900000)
	res.send(productMetadata)
	console.log(`GET ${req.params.id}`)
	console.timeEnd()
	console.log(new Date())
	console.log("")
})

app.get("/api/products",(req,res)=>{
	let products=db.prepare("SELECT * FROM products").all();
	res.json(products)
})


//POST Routes
app.post("/api/products/new", body, upload.single('product_image'), async (req, res) => {
	let ext = utils.getExt(req.file.originalname)
	let name = utils.computeHash(req.file.originalname + Math.random()) + ext
	name.replace("/","|")
	//Insert into DB next
	await app.locals.bucket.file(name).createWriteStream().end(req.file.buffer)
	res.json({ status: "200 OK" })
})


app.listen(3000, () => { console.log("Server running...");console.log("")})
