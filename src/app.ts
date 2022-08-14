import express from "express";
import * as dotenv from "dotenv";
dotenv.config({});
console.log(process.env.PORT, "whyyy");
import connectToDB from "./utils/dbConnection";
import authRouter from "./routers/auth";
import cors from "cors";
import { errorHandler } from "./middlewares/ErrorHandler";

const app = express();

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })), app.use(express.json());
app.use("/auth", authRouter);
console.log(__dirname.replace("build","public"))
app.use(express.static(__dirname.replace("build","public")))

app.use(errorHandler);

connectToDB(() => {
	app.listen(process.env.PORT, (): void => {
		console.log(`app is listening on port ${process.env.PORT}`);
	});
});
