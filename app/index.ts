

//Types for database
import { order, account, customer, product } from "./types";
import db from './db';

//Express imports
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

//Express addons for parsing data from the request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Database setup



//Express view engine setuo
app.set("view-engine", "ejs");
app.use("/views", express.static("views"));

app.get("/", async (req, res) => {
  res.render("homepage/index.ejs");
});

app.listen(80, () => {
  console.log("Server running...");
  console.log("");
});
