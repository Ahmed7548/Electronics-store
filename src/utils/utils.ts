import fs from "fs"
import { sign } from "jsonwebtoken";

export const createTokens = (name: {
  first: string;
  family:string
},email:string): {
	accessToken: string;
	refreshToken: string;
} => {
	const accessToken = sign(
		{ name: name, email: email },
		process.env.SECRET as string,
		{ expiresIn: 60 * 10, noTimestamp: false }
	);
	const refreshToken = sign(
		{ name:name, email: email },
		process.env.REFRESHSECRET as string,
		{ expiresIn: "1 days", noTimestamp: false }
	);

	return {refreshToken,accessToken};
};


export const getImgUrl = (file:Express.Multer.File|undefined):string => {
	if(!file) return ""

	return file.path.replaceAll(`\\`, `/`).replace(/public/g, "");
};



export const deleteFile = (...paths:string[]):void => {
	paths.forEach((path) => {
		console.log(`../public${path}`)
		fs.unlink(`./public/${path}`, (err) => {
			console.log(err);
		});
	});
}