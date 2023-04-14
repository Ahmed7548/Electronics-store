import { NextFunction, Request, RequestHandler, Response } from "express";
import { User } from "../models/User";
import { OAuth2Client } from "google-auth-library";
import { getImgUrl, deleteFile } from "../utils/utils";
import { createTokens } from "../utils/Token/createToken";
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

interface Login {
	email: string;
	password: string;
}

/* Deals with authentication with google */
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
			const { accessToken, refreshToken } = createTokens({
				data: { name: user.name, email: user.email },
				accessSecret: process.env.SECRET,
				refreshSecret: process.env.REFRESHSECRET,
			});
			res.status(200).json({
				user: {
					...user,
					password: null,
				},
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
		const { accessToken, refreshToken } = createTokens({
			data: { name: newUser.name, email: newUser.email },
			accessSecret: process.env.SECRET,
			refreshSecret: process.env.REFRESHSECRET,
		});
		res.status(200).json({
			user: {
				...newUser,
				password: null,
			},
			accessToken: accessToken,
			refreshToken: refreshToken,
		});
		return;
	} catch (err) {
		console.log(err);
		res.status(500).send({ err: err });
	}
};

/* signing up with regular email */
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

		res.status(200).json({ message: "user signed up successfully " });
		return;
	} catch (err) {
		deleteFile(fileUrl);
		next(err);
	}
};

/* loging in */
export const login: RequestHandler<never, any, Login> = async (
	req,
	res,
	next
) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			throw new HttpError(
				"there is no user with this email please register",
				400
			);
		}
		const passwordValid = await user.comparePassword(password);
		if (!passwordValid) {
			throw new HttpError(
				"you entered a wrong password please try again later",
				401
			);
		}
		const { accessToken, refreshToken } = createTokens({
			data: { name: user.name, email: user.email },
			accessSecret: process.env.SECRET,
			refreshSecret: process.env.REFRESHSECRET,
		});
		res.status(200).json({
			user: {
				...user,
				password: null,
			},
			accessToken: accessToken,
			refreshToken: refreshToken,
		});
		res.send(user);
	} catch (err) {
		next(err);
	}
};
