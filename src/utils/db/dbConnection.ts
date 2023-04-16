import { connect } from "mongoose";

const connectToDB = async (cb: Function): Promise<void> => {
	try {
		console.log(process.env.DBURI);
		const db = await connect(process.env.DBURI ||"mongodb://127.0.0.1/electronic-shop", {
			autoIndex: true,
			autoCreate: true,
		});
		cb();
		process.on("exit", () => {
			db.disconnect();
		});
	} catch (err) {
		console.log("error", err);
	}
};

export default connectToDB;
