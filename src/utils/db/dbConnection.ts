import { connect } from "mongoose";

const connectToDB = async (cb: Function): Promise<void> => {
	try {
		console.log(process.env.DBURI);
		const db = await connect(process.env.DBURI as string, {
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
