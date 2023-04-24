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

const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/prod", productRouter);

app.use(express.static(__dirname.replace("build", "public")));

app.use(errorHandler);

connectToDB(() => {
	app.listen(process.env.PORT, (): void => {
		console.log(`app is listening on port ${process.env.PORT}`);
	});
});
