import express from "express";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url"
import path from "path";
dotenv.config({});
import connectToDB from "./utils/db/dbConnection.js";
import authRouter from "./routers/auth.js";
import productRouter from "./routers/product.js";
import cors from "cors";
import { errorHandler } from "./middlewares/ErrorHandler.js";
import cookieParser from "cookie-parser";


declare global {
	namespace Express {
	  interface Request {
		user?: {
			name:{
				first:string;
				family:string;
			};
			id:string
			email:string;
			verified:boolean
		};
		userAuth?:"GUEST"|"A_USER"|"UNA_USER"
	  }
	}
  }



const app = express();


// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())


//test working
app.get("/",(req,res,next)=>{
	res.send("working")
})

app.use("/auth", authRouter);
app.use("/prod", productRouter);

app.use(express.static(__dirname.replace("build", "public")));

app.use(errorHandler);

connectToDB(() => {
	app.listen(process.env.PORT, (): void => {
		console.log(`app is listening on port ${process.env.PORT}`);
	});
});
