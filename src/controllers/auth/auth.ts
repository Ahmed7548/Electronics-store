import { NextFunction, Request, Response } from "express";
import { AsyncCustomRequestHandler } from "../../types";
import { User } from "../../models/User";
import { OAuth2Client } from "google-auth-library";
import { getImgUrl } from "../../utils/helpers/getImage";
import { createTokens } from "../../utils/Token/createToken";
import HttpError from "../../Errors/HTTPError";
import { ConWithGoogleReq } from "../../json-schemas/schemas/conWithGoogle";
import { SignUp } from "../../json-schemas/schemas/signUp";
import { Login } from "../../json-schemas/schemas/login";

const client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	"postmessage"
);

/* Deals with authentication with google */
export const continueWithGoogle: AsyncCustomRequestHandler<
	any,
	ConWithGoogleReq
> = async (req: Request, res: Response, next: NextFunction) => {
	const { credentials } = req.body;

	const ticket = await client.verifyIdToken({
		idToken: credentials,
		audience: process.env.GOOGLE_CLIENT_ID,
	});

	const profile = ticket.getPayload();

	console.log(profile);

	if (!profile) {
		throw new HttpError("the user was not found in the google Api", 404);
	}
	const user = await User.findOne({ googleId: profile.sub });

	// if user already exist
	if (user) {
		const { accessToken, refreshToken } = createTokens({
			data: { name: user.name, email: user.email },
			accessSecret: process.env.SECRET,
			refreshSecret: process.env.REFRESHSECRET,
		});
		res.status(200).json({
			user: Object.assign(user, { password: undefined }),
			accessToken,
			refreshToken,
		});
		return;
	}
	//else create new user
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
		user: Object.assign(newUser, { password: undefined }),
		accessToken: accessToken,
		refreshToken: refreshToken,
	});
	return;
};

/* signing up with regular email */
export const signup: AsyncCustomRequestHandler<any, SignUp> = async (
	req,
	res,
	next
) => {
	const { email, first, family, password, confirmedPassword } = req.body;
	const file = req.file;
	if (!req.file) {
		throw new HttpError("please add an image", 400);
	}
	const fileUrl = getImgUrl(file);
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
};

/* loging in */
export const login: AsyncCustomRequestHandler<any, Login> = async (
	req,
	res,
	next
) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email: email });
	// console.log(user)
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
		user: Object.assign(user, { password: undefined }),
		accessToken: accessToken,
		refreshToken: refreshToken,
	});
};