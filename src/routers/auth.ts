import { Router } from "express";
import { continueWithGoogle, login, signup } from "../controllers/auth";
import multer from "multer";
import HttpError from "../Errors/HTTPError";
import { validate } from "../middlewares/validator";
import { signUpSchema } from "../json-schemas/schemas/signUp";
import { loginSchema } from "../json-schemas/schemas/login";
import { conWithGoogleSchema } from "../json-schemas/schemas/conWithGoogle";

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
	validate({ schema: signUpSchema, whatToValidate: "body" }),
	signup
);

router.post(
	"/google",
	validate({ schema: conWithGoogleSchema, whatToValidate: "body" }),
	continueWithGoogle
);

router.post(
	"/login",
	validate({ schema: loginSchema, whatToValidate: "body" }),
	login
);

export default router;
