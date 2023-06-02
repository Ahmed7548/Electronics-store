import fs from "fs"

export const deleteFile = (...paths: string[]): void => {
	paths.forEach((path) => {
		fs.unlink(`./${path}`, (err) => {
			console.log(err);
		});
	});
};



// private deleteFile(...paths: string[]) {
//   paths.forEach((path) => {
//     console.log(path, "path from unlink ya man");
//     fs.unlink(`./${path}`, (err) => {
//       console.log(err);
//     });
//   });