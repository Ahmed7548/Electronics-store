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

interface ProductQueryHelpers {
	paginate: <T>(this: T, page: number, records: number) => T;
	byCategory: <T>(this: T, id: mongoose.Types.ObjectId | string) => T;
	byName: <T>(this: T, name: string) => T;
	byPrice: <T>(this: T, gt: number, lt: number) => T;
}
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
			},
			currency: {
				type: Number,
				default: "LE",
			},
		},
		categories: [
			{
				_id: {
					type: String,
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
		},
		tags: {
			type: [String],
		},
	},
	{
		methods: {},
		statics: {},
		query: {
			paginate(page: number, records: number) {
				const skipped = (page - 1) * records;
				return this.skip(skipped).limit(records);
			},
			byCategory(id: mongoose.Types.ObjectId | string) {
				return this.where("categories._id").equals(id);
			},
			byName(name: string) {
				return this.or([
					{ name: { $regex: `${name}`, $options: "i" } },
					{ describtion: { $regex: `${name}`, $options: "i" } },
					{ tags: { $regex: `${name}`, $options: "i" } },
					{ SKU: { $regex: `${name}`, $options: "i" } },
				]);
			},
			byPrice(gt: number, lt: number) {
				return this.where("price.price").gte(gt).lte(lt);
			},
		},
	}
);

export const Product = model<Product, ProductModel>("Product", productSchema);
