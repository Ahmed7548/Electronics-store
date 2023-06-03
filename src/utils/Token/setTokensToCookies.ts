import { Response } from "express";
export const setTokenToCookies = (
  res: Response,
  accessToken?: string,
  refreshToken?: string
) => {
  if (accessToken)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
    });
  if (refreshToken)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      path: "/auth/access",
    });
};
