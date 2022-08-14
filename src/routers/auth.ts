import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { continueWithGoogle, signup } from "../controllers/auth";
import multer, { Multer } from "multer";
import HttpError from "../Errors/HTTPError";

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
			callback(new HttpError("please add file with either the extension of '.png', '.jpeg', or 'jpg'",400));
			return;
		}
		if(!file) return  callback(null,false)
		callback(null,true)
	},
});

const router = Router();

router.post("/signup",upload.single("avatar"), signup);

router.post("/google", continueWithGoogle);

export default router;
