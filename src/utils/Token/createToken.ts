import * as jwt from "jsonwebtoken";
import UnhandledError from "../../Errors/UnhandledError.js";

const {sign}=jwt

interface TokenObject {
	accessToken: string;
	refreshToken: string;
}

interface Options {
	data: {
		[key: string]: any;
	};
	accessSecret: string | undefined;
	refreshSecret: string | undefined;
	accessTokenExp?: string | number | undefined;
	refreshTokenExp?: string | number | undefined;
}

// there is a better way to improve this by adding an options parameter
export const createTokens = ({
	data: { email, name,id,verified },
	refreshSecret,
	accessSecret,
	accessTokenExp ="1 day",
	refreshTokenExp = "1 days",
}: Options): TokenObject => {
	if (!accessSecret) {
		throw new UnhandledError(
			"please provide an accessSecret secret to the createtoken function"
		);
	}
	if (!refreshSecret) {
		throw new UnhandledError(
			"please provide an refreshSecret secret to the createtoken function"
		);
	}
	const accessToken = sign({ name: name, email: email,id:id,verified:verified }, accessSecret, {
		expiresIn: accessTokenExp,
		noTimestamp: false,
	});
	const refreshToken = sign({ name: name, email: email,id,verified }, refreshSecret, {
		expiresIn: refreshTokenExp,
		noTimestamp: false,
	});

	return { refreshToken, accessToken };
};
