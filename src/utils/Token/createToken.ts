import * as jwt from "jsonwebtoken";
import UnhandledError from "../../Errors/UnhandledError.js";

const { sign } = jwt;

interface TokenObject {
  accessToken?: string;
  refreshToken?: string
}

interface Options {
  data: {
    [key: string]: any;
  };
  accessSecret?: string ;
  refreshSecret?: string ;
  accessTokenExp?: string | number | undefined;
  refreshTokenExp?: string | number | undefined;
}

// there is a better way to improve this by adding an options parameter
export const createTokens = ({
  data: { email, name, id, verified },
  refreshSecret,
  accessSecret,
  accessTokenExp = "1 day",
  refreshTokenExp = "1 days",
}: Options): TokenObject => {

	const tokens:TokenObject={}

  if (accessSecret) {
    tokens.accessToken = sign(
      { name: name, email: email, id: id, verified: verified },
      accessSecret,
      {
        expiresIn: accessTokenExp,
        noTimestamp: false,
      }
    );
  }
  if(refreshSecret){
	  tokens.refreshToken = sign(
		{ name: name, email: email, id: id, verified: verified },
		refreshSecret,
		{
		  expiresIn: refreshTokenExp,
		  noTimestamp: false,
		}
	  );
  }

  return tokens;
};
