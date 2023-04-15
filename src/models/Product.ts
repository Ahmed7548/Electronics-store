import mongoose, { Schema, model, Model } from "mongoose";
const ObjectID = Schema.Types.ObjectId;

interface Product {
	SKU: string;
	name: string;
	price: {
		price: number;
		currency: string;
	};
	discount?: {
		type: "VALUE" | "PERCENT";
		discount: number;
	};
	images: {
		thumbnail: string;
		images: string[];
	};
	describtion: string;
	categories: {
		id: mongoose.Types.ObjectId;
		name: string;
	}[];
	tags: string[];
}

interface ProductQueryHelpers {}
interface ProductMethods {}

type ProductModel = Model<Product, ProductQueryHelpers, ProductMethods>;

const productSchema = new Schema<Product, ProductModel, ProductMethods>(
	{
		SKU: {
			type: String,
			required: true,
			index: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
		},
		price: {
			price: {
				type: Number,
				required: true,
			},
			currency: {
				type: Number,
				default: "LE",
			},
			required: true,
		},
		categories: [
			{
				id: {
					type: ObjectID,
				},
				name: String,
			},
		],
		describtion: {
			type: String,
			required: true,
		},
		discount: {
			type: {
				type: String,
				enum: ["PERCENT", "VALUE"],
			},
			discount: {
				type: Number,
			},
		},
		images: {
			thumbnail: String,
			images: [String],
			required: true,
		},
		tags: {
			type: [String],
			required: true,
		},
	},
	{
		methods: {},
		statics: {},
	}
);

export const Product = model<Product, ProductModel>("Product", productSchema);
