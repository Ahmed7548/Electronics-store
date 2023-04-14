import fs from "fs";

// there is a better way to improve this by adding an options parameter 

export const getImgUrl = (file: Express.Multer.File | undefined): string => {
	if (!file) return "";

	return file.path.replaceAll(`\\`, `/`).replace(/public/g, "");
};

export const deleteFile = (...paths: string[]): void => {
	paths.forEach((path) => {
		fs.unlink(`./public/${path}`, (err) => {
			console.log(err);
		});
	});
};
