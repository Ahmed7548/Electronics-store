import mongoose, { Schema, model, Model, Document } from "mongoose";

export interface ProductIn {
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
  stock: {
    qtyInStock: number;
    qtySold: number;
  };
  images: {
    thumbnail: string;
    images: string[];
  };
  describtion: string;
  categories: {
    id: mongoose.Types.ObjectId;
    name: String;
  }[];
  tags: string[];
  forSale: boolean;
  promotionScore:number
}

interface ProductQueryHelpers {
  paginate: <T>(this: T, options: { page: number; records: number }) => T;
  byCategory: <T>(this: T, id: mongoose.Types.ObjectId | string) => T;
  bySearch: <T>(this: T, name: string) => T;
  byPrice: <T>(this: T, options: { gt?: number; lt?: number }) => T;
}
interface ProductMethods {}

interface ProductModel
  extends Model<ProductIn, ProductQueryHelpers, ProductMethods> {
    getPromoted: (this:ProductModel,productsLimit:number) => Promise<Document<any, any, ProductModel>[] | null>;
}

const productSchema = new Schema<ProductIn, ProductModel, ProductMethods>(
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
        type: String,
        default: "LE",
      },
    },
    stock: {
      qtyInStock: {
        type: Number,
        default: 0,
      },
      qtySold: {
        type: Number,
        default: 0,
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
    forSale: {
      type: Boolean,
      default: true,
    },
	promotionScore:{
		type:Number,
		default:0,
		index:true
	}
  },
  {
    methods: {},
    statics: {
      getPromoted(productsLimit:number):Promise<Document<any, any, ProductModel>[] | null>{
		return this.find().sort("-promotionScore").limit(productsLimit).exec()
	  },
    },
    query: {
      paginate({ page, records }: { page: number; records: number }) {
        const skipped = (page - 1) * records;
        return this.skip(skipped).limit(records);
      },
      byCategory(id: mongoose.Types.ObjectId | string) {
        return this.where("categories._id").equals(id);
      },
      bySearch(search: string) {
        return this.or([
          { name: { $regex: `${search}`, $options: "i" } },
          { describtion: { $regex: `${search}`, $options: "i" } },
          { tags: { $regex: `${search}`, $options: "i" } },
          { SKU: { $regex: `${search}`, $options: "i" } },
        ]);
      },
      byPrice({ gt, lt }: { gt?: number; lt?: number }) {
        const query = this.where("price.price");
        if (gt) {
          query.gte(gt);
        }
        if (lt) {
          query.lt(lt);
        }
        return query;
      },
    },
  }
);

export const Product = model<ProductIn, ProductModel>("Product", productSchema);
