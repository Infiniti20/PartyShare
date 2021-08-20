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

//Express imports
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

//Express addons for parsing data from the request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Firebase Setup
import firebase from "firebase-admin";
import adminSDK from "../admin-sdk.json";

firebase.initializeApp({
  credential: firebase.credential.cert(adminSDK as firebase.ServiceAccount),
  storageBucket: process.env.BUCKET_URL,
});

const firedb = firebase.firestore();

//Stripe setup
import Stripe from "stripe";

const stripe = new Stripe(process.env.StripeSK, {
  apiVersion: "2020-08-27",
});

console.log(process.env.StripeSK);

app.set("view engine", "ejs");
app.use("/views", express.static("views"));

// ! Routes
app.get("/", async (req, res) => {
  res.render("homepage/index");
});

app.get("/vendor-login", async (req, res) => {
  res.render("vendor-login/index");
});

app.get("/accounts/create", async (req, res) => {
  const hash = utils.computeHash(Math.random().toString());
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

app.post("/accounts/login", async (req, res) => {
  let idToken = req.body.idToken;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  let sessionCookie = await firebase
    .auth()
    .createSessionCookie(idToken, { expiresIn });

  const options = { maxAge: expiresIn }; // httpOnly: true, secure: true };

  res.cookie("session", sessionCookie, options);


  res.end(JSON.stringify({ status: "success" }));
});

app.get("/verify", async (req, res) => {
  const idToken = req.cookies.session;

  const claims = await firebase.auth().verifySessionCookie(idToken);
  console.log(claims);
  res.send("complete");
});

app.listen(80, () => {
  console.log("Server running...");
  console.log("");
});
