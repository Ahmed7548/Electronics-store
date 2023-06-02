export const getImgUrl = (file: Express.Multer.File | undefined): string => {
	if (!file) return "";
	return file.path.replaceAll(`\\`, `/`).replace(/public/g, "");
};


