import { Schema, model, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
const ObjectID = Schema.Types.ObjectId;
interface UserProps {
	name: {
		first: string;
		family: string;
	};
	email: string;
	googleId?: string;
	imageUrl?: string;
	unHashedPasword?: string | null;
	password?:
		| string
		| {
				hash: string;
				salt: string;
		  };
	orders: [];
}

interface UserMethods {
	comparePassword: (password: string) => Promise<boolean>;
}

type UserModel = Model<UserProps, {}, UserMethods>;

const userSchema = new Schema<UserProps, UserModel, UserMethods>(
	{
		name: {
			first: {
				type: String,
				requred: true,
			},
			family: {
				type: String,
				required: true,
			},
		},
		email: {
			type: String,
			index: { unique: true },
			required: true,
		},
		password: {
			hash: {
				type: String,
			},
			salt: {
				type: String,
			},
		},
		unHashedPasword: {
			type: String,
		},
		imageUrl: {
			type: String,
		},
		googleId: {
			type: String,
			index: true,
		},
		orders: [
			{
				type: ObjectID,
				ref: "orders",
			},
		],
	},
	{ autoCreate: true, autoIndex: true }
);

// userSchema.methods.comparePassword(async function (
// 	password: string
// ): Promise<boolean> {
// 	if (typeof this.password === "string") return false;
// 	if (!this.password?.hash) return false;
// 	return await bcrypt.compare(password, this.password?.hash);
// });

userSchema.method(
	"comparePassword",
	async function (password: string): Promise<boolean> {
		if (typeof this.password === "string") return false;
		if (!this.password?.hash) return false;
		return await bcrypt.compare(password, this.password?.hash);
	}
);

userSchema.pre("save", async function (next) {
	const unHashedPasword: string = this.unHashedPasword as string;
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(unHashedPasword, salt);
	this.password = {
		hash: hash,
		salt: salt,
	};
	this.unHashedPasword = undefined;
	this.googleId = undefined;
	next();
});

// doc methods

export const User = model<UserProps, UserModel>("User", userSchema);
