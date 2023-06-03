import { Router } from "express";
import { continueWithGoogle, login, signup } from "../controllers/auth/auth.js";
import multer from "multer";
import HttpError from "../Errors/HTTPError.js";
import { validate } from "../middlewares/validator.js";
import { signUpSchema } from "../json-schemas/schemas/signUp.js";
import { loginSchema } from "../json-schemas/schemas/login.js";
import { conWithGoogleSchema } from "../json-schemas/schemas/conWithGoogle.js";
import catchAsycError from "../utils/helpers/catchAsycError.js";
import { verifyUserEmail } from "../controllers/auth/verifyUserEmail.js";

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
			console.log("here");
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
	catchAsycError(signup)
);

router.post(
	"/google",
	validate({ schema: conWithGoogleSchema, whatToValidate: "body" }),
	catchAsycError(continueWithGoogle)
);

router.post(
	"/login",
	validate({ schema: loginSchema, whatToValidate: "body" }),
	catchAsycError(login)
);

router.get("/access",)


router.get("/verify/:id",catchAsycError(verifyUserEmail))

export default router;
