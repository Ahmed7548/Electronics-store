import { Schema, model, Model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { verify } from "jsonwebtoken";
import HttpError from "../Errors/HTTPError.js";
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
	verified: boolean;
	verificationToken: string;
	orders: [];
}

interface UserMethods {
	comparePassword: (password: string) => Promise<boolean>;
}

interface UserModel extends Model<UserProps, {}, UserMethods> {
	verify: (
		this: UserModel,
		id: string,
		verificationCode: string
	) => Promise<Document<any, any, UserModel> | null>;
}

const userSchema = new Schema<UserProps>(
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
		verified: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
		},
		orders: [
			{
				type: ObjectID,
				ref: "orders",
			},
		],
	},
	{
		methods: {
			async comparePassword(password: string): Promise<boolean> {
				if (typeof this.password === "string") return false;
				if (!this.password?.hash) return false;
				return await bcrypt.compare(password, this.password?.hash);
			},
		},
		statics: {
			async verify(
				id: string,
				verificationCode: string
			): Promise<Document<any, any, UserModel> | null> {
				const user = await this.findById(id);
				if(!user) throw new HttpError("there is no user with that id",404)
				if (user.verified) {
					throw new HttpError("this user is already verified",400)
				}
				if(user.verificationToken===verificationCode){
					user.verified = true
					const result=await user.save()
					return result
				}
				throw new HttpError("the verification code is incorrect",401)
			},
		},
		autoCreate: true,
		autoIndex: true,
	}
);

userSchema.pre("save", async function (next) {
	const unHashedPasword = this.unHashedPasword;
	// in case the user signing up with google the unHashedPassword would be undefined
	if (!unHashedPasword) {
		next();
		return;
	}
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
