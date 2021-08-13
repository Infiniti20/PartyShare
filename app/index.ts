import { order, account, customer, product } from "./types";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

//Express addons for parsing data from the request
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

//Express view engine setuo
app.set("view-engine", "ejs");
app.use('/views', express.static("views"))

app.get("/", (req, res)=>{
    res.render('homepage/index.ejs')
})





app.listen(80, () => { console.log("Server running..."); console.log("") })
