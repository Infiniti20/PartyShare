import utils from "./utils";
import dotenv from "dotenv";
dotenv.config();
const URL = "http://partyshare.ca";

// Database setup
import { Database } from "./database";
import { order, account, customer, product } from "./types";
const db = new Database("database/partyshare.db");

async function createDB() {
  db.exec(
    "CREATE TABLE IF NOT EXISTS accounts ( id varchar(25) PRIMARY KEY, name varchar(100), email varchar(80), authID varchar(28), location varchar(250) ) "
  );
  db.exec(
    "CREATE TABLE IF NOT EXISTS products ( name varchar(75), id varchar(25), accountID varchar(25), imageURL varchar(55), category varchar(12), desc varchar(250), info varchar(200), quantity int, price int )"
  );
}

createDB();

import { CacheLayer } from "./cache";
const cache = new CacheLayer();

//Express imports
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

//Express addons for parsing data from the request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use("/views", express.static("views"));

//Firebase Setup
import firebase from "firebase-admin";
import adminSDK from "../admin-sdk.json";

firebase.initializeApp({
  credential: firebase.credential.cert(adminSDK as firebase.ServiceAccount),
  storageBucket: process.env.BUCKET_URL,
});

const firedb = firebase.firestore();
app.locals.bucket = firebase.storage().bucket();

//Stripe setup
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: "2020-08-27",
});

//Sharp setup
import sharp from "sharp";

//Multer setup
import multer from "multer";
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: utils.filter,
});

//Date editing setup
import { updateDates, DateTable } from "./editDates";

// ! TEMP
import sourcemap from "source-map-support";
sourcemap.install();

// ! Functions
async function authWithCookies(
  idToken: string,
  days: number,
  res: express.Response
): Promise<void> {
  const expiresIn = 60 * 60 * 24 * days * 1000;

  let sessionCookie = await firebase
    .auth()
    .createSessionCookie(idToken, { expiresIn });

  const options = { maxAge: expiresIn }; // httpOnly: true, secure: true };
  res.cookie("session", sessionCookie, options);
}

async function verifyCookie(sessionCookie: string): Promise<string> {
  const data = await firebase
    .auth()
    .verifySessionCookie(sessionCookie || "")
    .catch(() => {
      return null;
    });

  return data.uid || null;
}

async function getUser(uid: string): Promise<account> {
  return (await cache.getAsync(uid, async () => {
    return await db.get("SELECT * FROM accounts WHERE authID = ?", uid);
  })) as account;
}

// ! Routes

// * HTML REQUESTS
app.get("/", async (req, res) => {
  const products = (await cache.getAsync("explore", async () => {
    return await db.all("SELECT id, name, imageURL, price FROM products");
  })) as product[];
  res.render("main/index", { acc: req.cookies.session, products });
});

app.get("/search", async (req, res) => {
  const products = (await db.all(
    "SELECT id, name, imageURL, price FROM products WHERE name LIKE ? AND category LIKE ?",
    `%${req.query.query}%`,
    `%${req.query.category || ""}%`
  )) as product;
  res.render("main/index", { acc: req.cookies.session, products });
});

// ! Add option to disable renting through site, force contact through email for third party businesses.
app.get("/product/:id", async (req, res) => {
  let cachedFireData = await cache.getAsync(
    `fire-${req.params.id}`,
    async () => {
      const firedata = await firedb
        .collection("products")
        .doc(req.params.id)
        .get();
      return firedata.data();
    },
    1209600000
  );

  const product = (await cache.getAsync(req.params.id, async () => {
    return await db.get("SELECT * FROM products WHERE id = ?", req.params.id);
  })) as product;

  const account = (await cache.getAsync(product.accountID, async () => {
    return await db.get(
      "SELECT * FROM accounts WHERE id = ?",
      product.accountID
    );
  })) as account;

  res.render("products/index", {
    product,
    account,
    dates: cachedFireData,
    acc: req.cookies.session,
  });
});

app.get("/faq", async (req, res) => {
  res.render("faq/index", {
    acc: req.cookies.session,
    faqs: [
      {
        title: "How do I start renting on PartyShare?",
        text: "You can contact me at janakhosa@gmail.com to get in touch, and we can help you set up your account!",
      },
      {
        title: "What information does PartyShare store about me?",
        text: "PartyShare only stores your email address and nothing else! This is just to contact you about your order, and give you updates on it.",
      },
    ],
  });
});

app.get("/vendor-login", async (req, res) => {
  res.render("vendor-login/index", { acc: req.cookies.session });
});

app.get("/products/create", async (req, res) => {
  const uid = await verifyCookie(req.cookies.session);

  if (uid == null) {
    res.redirect("/");
  }

  const user = await getUser(uid);

  res.render("add/index", { name: user.name });
});

app.get("/checkout", (req, res) => {
  try {
    if (!req.cookies.customerID) {
      res.redirect("/");
      return;
    }
    const { secret, product, info } = cache.get(
      `tempcache-${req.cookies.customerID}`,
      () => {}
    );

    if (!product) {
      res.redirect("/");
      return;
    }

    res.render("checkout/index", {
      secret,
      product,
      info,
      acc: req.cookies.session,
    });
  } catch {
    res.redirect("/");
  }
});

app.get("/accounts/create", async (req, res) => {
  const hash = utils.computeHash(Math.random().toString()).replace("/", "|");
  const account = await stripe.accounts.create({
    type: "express",
    country: "CA",
    business_type: "individual",
  });
  console.log(`${URL}/accounts/create`);
  const accountLinks = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${URL}/accounts/create/`,
    return_url: `${URL}/accounts/create/${hash}`,
    type: "account_onboarding",
  });

  res.cookie("stripeID", account.id);
  res.redirect(accountLinks.url);
});

app.get("/accounts/create/:hash", async (req, res) => {
  res.render("create-account/index");
});

// * POST REQUESTS
app.post("/accounts/login", async (req, res) => {
  console.log(req.body);
  let idToken = req.body.idToken;

  await authWithCookies(idToken, 14, res);

  res.end(JSON.stringify({ status: "success" }));
});

app.post("/accounts/create", async (req, res) => {
  let idToken = req.body.idToken;
  const authID = (await firebase.auth().verifyIdToken(idToken)).uid;

  await authWithCookies(idToken, 14, res);

  const account: account = {
    id: req.cookies.stripeID,
    name: req.body.name,
    email: req.body.email,
    authID,
    location: req.body.location,
  };
  await db.run(
    "INSERT INTO accounts VALUES (?, ?, ?, ?, ?);",
    ...Object.values(account)
  );

  res.clearCookie("stripeID");
  res.end(JSON.stringify({ status: "completed" }));
});

app.post("/products/create", upload.single("image"), async (req, res) => {
  const uid = await verifyCookie(req.cookies.session);

  if (uid == null) {
    res.redirect("/");
  }

  const user = await getUser(uid);

  let name = `${utils
    .computeHash(req.file.originalname + Math.random())
    .replace(/\//g, "|")}.jpeg`;

  const sharpFile = await sharp(req.file.buffer)
    .resize({ width: 350, height: 350 })
    .jpeg({ quality: 70 })
    .toBuffer();
  await app.locals.bucket.file(name).createWriteStream().end(sharpFile);

  const productID = utils.generateUID();

  await db.run(
    "INSERT INTO products VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    req.body["desktop-name"] || req.body["mobile-name"],
    productID,
    user.id,
    name,
    req.body.category,
    req.body.desc,
    req.body.info,
    parseInt(req.body.quantity),
    parseInt(req.body.price.substring(1)) * 100
  );

  cache.del("explore");

  await firedb.collection("products").doc(productID).set({
    "1263310860": 1,
  });

  cache.set(`fire-${productID}`, {
    "1263310860": 1,
  });

  res.json({ status: "200 OK", message: "Product successfully added." });
});

app.post("/orders/create", async (req, res) => {
  const customer = req.cookies.customerID;
  const paymentMethods = await stripe.paymentMethods.list({
    customer,
    type: "card",
  });
  let card = paymentMethods.data[0].id;

  const {
    secret,
    product,
    info,
  }: {
    secret: string;
    product: product;
    info: {
      quantity: number;
      daysRented: number;
      startDate: number;
      endDate: number;
    };
  } = cache.get(`tempcache-${customer}`, () => {});
  cache.del(`tempcache-${customer}`);
  const account = (await cache.getAsync(product.accountID, async () => {
    return await db.get(
      "SELECT * FROM accounts WHERE id = ?",
      product.accountID
    );
  })) as account;

  const firebaseData = await cache.getAsync(`fire-${product.id}`, async () => {
    const fireQuery = await firedb.collection("products").doc(product.id).get();
    return fireQuery.data();
  });
  console.log(firebaseData)
  const updatedDates: DateTable = updateDates(
    firebaseData,
    info.startDate,
    info.endDate,
    info.quantity,
    product.quantity
  );
  console.log(updateDates)
  await firedb
    .collection("products")
    .doc(product.id)
    .set(updatedDates, { merge: true });

  cache.del(`fire-${product.id}`);
  cache.del(`tempcache-${customer}`);

  utils.sendMail(
    req.body.email,
    "Order Confirmation",
    "views/templates/location.html",
    {
      USER: req.body.name,
      EMAIL: req.body.email,
      DATE: new Date(info.startDate).toDateString(),
      ADDRESS: account.location,
    }
  );

  utils.sendMail(account.email, "New Order", "views/templates/order.html", {
    USER: account.name,
    EMAIL: req.body.email,
    ITEM: product.name,
    QUANT: info.quantity,
    DATE: new Date(info.startDate).toDateString(),
    DATE2: new Date(info.endDate).toDateString(),
  });
});

app.post("/checkout", async (req, res) => {
  // ! ADD DATE VERIFICATION HERE
  const customer = await stripe.customers.create();
  const intent = await stripe.setupIntents.create({
    customer: customer.id,
  });

  const session = cache.set(
    customer.id,
    { name: "", id: customer.id, email: "" } as customer,
    18000000
  );
  res.cookie("customerID", customer.id);
  const { startDate, endDate, quantity, productID } = req.body;

  const daysRented = Math.max(startDate - endDate, 1);

  const product = (await cache.getAsync(productID, async () => {
    return await db.get("SELECT * FROM products WHERE id = ?", productID);
  })) as product;

  const total = product.price * quantity * daysRented;
  cache.set(
    `tempcache-${customer.id}`,
    {
      secret: intent.client_secret,
      product,
      info: { quantity, daysRented, startDate, endDate },
    },
    3600000
  );
  res.json({ status: "200 OK", message: "Checkout page ready." });
});

// * GET REQUESTS
app.get("/logout", async (req, res) => {
  res.clearCookie("session");
  res.redirect("/");
});

app.listen(80, () => {
  console.log("Server running...");
  console.log("");
});
