import { Router } from "express";
import { continueWithGoogle, login, signup } from "../controllers/auth";
import multer from "multer";
import HttpError from "../Errors/HTTPError";
import { jsonValidator } from "../middlewares/jsonSchemaValidator";

const multerStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/uploads/user-images");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const extension =
			file.mimetype.split("/")[file.mimetype.split("/").length - 1];
		cb(null, file.fieldname + "-" + uniqueSuffix + `.${extension}`);
	},
});

const upload = multer({
	storage: multerStorage,
	fileFilter(req, file, callback) {
		if (
			file &&
			file.mimetype !== "image/png" &&
			file.mimetype !== "image/jpeg" &&
			file.mimetype !== "image/jpg"
		) {
			callback(
				new HttpError(
					"please add file with either the extension of '.png', '.jpeg', or 'jpg'",
					400
				)
			);
			return;
		}
		if (!file) return callback(null, false);
		callback(null, true);
	},
});

const router = Router();

router.post(
	"/signup",
	upload.single("avatar"),
	jsonValidator.validate({ schemaName: "sign-up", WhatToValidate: "body" }),
	signup
);

router.post("/google", continueWithGoogle);

router.post(
	"/login",
	jsonValidator.validate({ schemaName: "login", WhatToValidate: "body" }),
	login
);

export default router;
