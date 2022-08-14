import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { OAuth2Client } from "google-auth-library";
import { createTokens, getImgUrl,deleteFile } from "../utils/utils";
import HttpError from "../Errors/HTTPError";

const client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	"postmessage"
);

interface SignUp {
	first: string;
	family: string;
	email: string;
	password: string;
	confirmedPassword: string;
}

export const continueWithGoogle = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { credentials } = req.body as { credentials: string };

	try {
		const ticket = await client.verifyIdToken({
			idToken: credentials,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const profile = ticket.getPayload();

		if (!profile) {
			res.status(404).json({ msg: "the user was not found in the google Api" });
			return;
		}
		const user = await User.findOne({ googleId: profile.sub });

		if (user) {
			const { accessToken, refreshToken } = createTokens(user.name, user.email);
			res.status(200).json({
				user: user,
				accessToken,
				refreshToken,
			});
			return;
		}
		const newUser = new User({
			email: profile.email,
			name: { first: profile.given_name, family: profile.family_name },
			googleId: profile.sub,
			imageUrl: profile.picture,
		});
		await newUser.save();
		const { accessToken, refreshToken } = createTokens(
			newUser.name,
			newUser.email
		);
		res.status(200).json({
			user: newUser,
			accessToken: accessToken,
			refreshToken: refreshToken,
		});
		return;
	} catch (err) {
		console.log(err);
		res.status(500).send({ err: err });
	}
};

export const signup = async (
	req: Request<never, never, SignUp>,
	res: Response,
	next: NextFunction
) => {
	const { email, first, family, password, confirmedPassword } = req.body;
	const file = req.file;
	const fileUrl = getImgUrl(file);
	try {
		if (password.trim() !== confirmedPassword.trim()) {
			throw new HttpError(
				"password and confirmed password are not the same",
				400
			);
		}
		const user = new User({
			email: email,
			name: {
				first: first,
				family: family,
			},
			imageUrl: fileUrl,
			unHashedPasword: password,
		});

		await user.save();

		res.status(200).json(user);
		return;
	} catch (err) {
		deleteFile(fileUrl)
		next(err);
	}
};
