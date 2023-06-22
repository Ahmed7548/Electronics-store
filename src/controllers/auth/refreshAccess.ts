import HttpError from "../../Errors/HTTPError";
import UnhandledError from "../../Errors/UnhandledError";
import { AsyncCustomRequestHandler } from "../../types";
import { verify, sign, JwtPayload } from "jsonwebtoken";
import BannedTokens from "../../models/BannedTokens";
import { createTokens } from "../../utils/Token/createToken";
import { setTokenToCookies } from "../../utils/Token/setTokensToCookies";

const timeRefreshTokenLives = process.env.REFRESH_TOKEN_TTL
  ? +process.env.REFRESH_TOKEN_TTL
  : 60 * 60 * 24;

export const refreshAccess: AsyncCustomRequestHandler = async (
  req,
  res,
  next
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!process.env.REFRESHSECRET) {
    throw new UnhandledError("provide a refresh secret");
  }

  verify(refreshToken, process.env.REFRESHSECRET, {}, async (err, decoded) => {
    if (err) {
      next(
        new HttpError(
          "can't refresh access the refresh token is either expired or incorrect",
          401
        )
      );
    } else {
      // checking if token exists
      const token = await BannedTokens.findOne({ refreshToken: refreshToken })
        .select("_id")
        .lean();
      // 403 for forbidden
      if (token) next(new HttpError("this user is banned", 403))
      const { id, iat, exp, name, email, verfied } = decoded as JwtPayload;
      console.log(refreshToken)
      // when the refresh token is near its expiry it itself is refreshed
      if (iat && exp && exp - iat < timeRefreshTokenLives / 4) {
        const { accessToken, refreshToken: newRefreshToken } = createTokens({
          accessSecret: process.env.SECRET,
          refreshSecret: process.env.REFRESHSECRET,
          data: {
            name,
            id,
            email,
            verfied,
          },
          refreshTokenExp: timeRefreshTokenLives,
        });
        setTokenToCookies(res, accessToken, newRefreshToken);
      } else {
        const { accessToken } = createTokens({
          accessSecret: process.env.SECRET,
          data: {
            name,
            id,
            email,
            verfied,
          },
          refreshTokenExp: timeRefreshTokenLives,
        });
        setTokenToCookies(res, accessToken);
      }
      res.status(200).json({msg:"tokens refreshed successfully"})
    }
  });
};
