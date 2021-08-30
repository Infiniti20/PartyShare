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
    "CREATE TABLE IF NOT EXISTS products ( name varchar(75), id varchar(25), accountID varchar(25), imageURL varchar(55), category varchar(12), desc varchar(250), info varchar(200), quantity int, price int, deposit int )"
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
app.locals.bucket = admin.storage().bucket()


//Stripe setup
import Stripe from "stripe";

const stripe = new Stripe(process.env.StripeSK, {
  apiVersion: "2020-08-27",
});

//Sharp setup
import sharp from 'sharp';

//Multer setup
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), fileFilter: utils.filter })



// ! Functions
async function AuthWithCookies(
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

async function VerifyCookie(sessionCookie: string): Promise<string> {
  const data = await firebase
    .auth()
    .verifySessionCookie(sessionCookie || "")
    .catch(() => {
      return null;
    });

  return data.uid || null;
}

async function GetUser(uid: string): Promise<account> {
  return cache.getAsync(uid, async () => {
    return await db.get("SELECT * FROM accounts WHERE AuthId = ?", uid);
  });
}



// ! Routes

// * HTML REQUESTS
app.get("/", async (req, res) => {
  res.render("homepage/index", { acc: req.cookies.session });
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
        title: "Will I get my deposit back?",
        text: "Yes! It does take 5 to 10 business days for it to actually show up in your account, so you may not see it right away.",
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
  const uid = await VerifyCookie(req.cookies.session);

  if(uid == null){ res.redirect("/") }

  const user = await GetUser(uid)

  res.render("add/index", {name: user.name})
});

app.get("/accounts/create", async (req, res) => {
  const hash = utils.computeHash(Math.random().toString()).replace("/", "|");
  const account = await stripe.accounts.create({
    type: "express",
    country: "CA",
    business_type: "individual",
  });

  const accountLinks = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${URL}/accounts/create`,
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
  let idToken = req.body.idToken;
  const authID = (await firebase.auth().verifyIdToken(idToken)).uid;

  await AuthWithCookies(idToken, 14, res);

  res.end(JSON.stringify({ status: "success" }));
});

app.post("/accounts/create", async (req, res) => {
  let idToken = req.body.idToken;
  const authID = (await firebase.auth().verifyIdToken(idToken)).uid;

  await AuthWithCookies(idToken, 14, res);

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

// app.post("/products/create", async(req,res)=>{
//     const uid = await VerifyCookie(req.cookies.session);

//   if(uid == null){ res.redirect("/") }

//   const user = await GetUser(uid)
// } )

// * GET REQUESTS
app.get("/logout", async (req, res) => {
  res.clearCookie("session");
  res.redirect("/");
});

app.listen(80, () => {
  console.log("Server running...");
  console.log("");
});
