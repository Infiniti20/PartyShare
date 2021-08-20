  //Database setup
  import {Database} from './database';
  import { order, account, customer, product } from "./types";
  const db = new Database('database/partyshare.db');

  //Express imports
  import express from "express";
  import cookieParser from "cookie-parser";

  const app = express();

  //Express addons for parsing data from the request
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  async function createDB(){
    db.exec("CREATE TABLE IF NOT EXISTS accounts (id varchar() PRIMARY KEY, name varchar(100), password varchar(45), ) ")
  }


  //Express view engine setup
  app.set("view-engine", "ejs");
  app.use("/views", express.static("views"));


  //Routes

  app.get("/", async (req, res) => {
    res.render("homepage/index.ejs");
  });

  app.listen(80, () => {
    console.log("Server running...");
    console.log("");
  });
