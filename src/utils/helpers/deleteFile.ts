import fs from "fs"

export const deleteFile = (...paths: string[]): void => {
	paths.forEach((path) => {
		fs.unlink(`./public/${path}`, (err) => {
			console.log(err);
		});
	});
};