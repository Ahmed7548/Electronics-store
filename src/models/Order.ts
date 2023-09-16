import mongoose, {
  Schema,
  Model,
  Types,
  Document,
  ClientSession,
  model,
} from "mongoose";
import { Product, ProductIn as FullPRoductIn } from "./Product";
import OrderError from "../Errors/OrderError";
import { User } from "./User";
import { applyDiscount } from "../utils/helpers/priceAfterDiscount";
import { Adress } from "../json-schemas/schemas/order";

interface ProductIn {
  id: string;
  qty: number;
  price: {
    value: number;
    currency: string;
  };
  image: string;
  name: string;
  totalPrice: number;
}

// don't forget adresses
// add order tracking

interface OrderIn {
  userId: Types.ObjectId;
  timeSchduale: {
    placementDate: Date;
    expectedDeliveryDate: Date;
    deliveredAt: Date | null;
  };
  products: ProductIn[];
  totalPrice: {
    value: number;
    currency: string;
    valAftDisc: number;
  };
  adresses: {
    billingAdress: Adress;
    shippingAdress: Adress;
  };
  shippingStatus:
    | "Order-Placed"
    | "Shipped"
    | "In-Transit"
    | "Out-for-Delivery"
    | "Delivered"
    | "Returned"
    | "Cancelled";
  cancel: () => Promise<void>;
}


interface OrderQueryHelper {
  paginate: <T>(this: T, options: { page: number; records: number }) => T;
}

interface OrderModelIn extends Model<OrderIn,OrderQueryHelper> {
  placeOrder: (
    this: OrderModelIn,
    payload: {
      products: { id: string; qty: number }[];
      discount: {
        type: "PERCENT" | "VALUE";
        value: number;
      };
      userId: Types.ObjectId;
      adresses: {
        shippingAdress: Adress;
        billingAdress: Adress;
      };
    }
  ) => Promise<void>;
}

// schema for adress --> could be moved to it's seperate file.
const adressSchema = new Schema({
  country: String,
  governerate: String,
  city: String,
  zipCode: String,
  streat: String,
  building: String,
  appartement: String,
  fullAdress: String,
});

const orderSchema = new Schema<OrderIn, OrderModelIn>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    timeSchduale: {
      placementDate: {
        type: Date,
        required: true,
      },
      expectedDeliveryDate: {
        type: Date,
        required: true,
      },
      deliveredAt: {
        type: Date,
        default: null,
      },
    },
    products: [
      {
        id: {
          type: Types.ObjectId,
          required: true,
        },
        image: String,
        name: String,
        price: {
          value: Number,
          currency: String,
        },
        qty: Number,
        totalPrice: Number,
      },
    ],
    totalPrice: {
      value: Number,
      currency: String,
      valAftDisc: Number,
    },
    adresses: {
      billingAdress: adressSchema,
      shippingAdress: adressSchema,
    },
    shippingStatus: { type: String, default: "Order-Placed" },
  },
  {
    query:{
        paginate({ page, records }: { page: number; records: number }) {
          const skipped = (page - 1) * records;
          return this.skip(skipped).limit(records);
        }
    },
    methods: {
      async cancel() {
        let productUpdate: ReturnType<typeof Product.updateOne>[] = [];
        if (this.shippingStatus === "Order-Placed") {
          productUpdate = this.products.map((product) => {
            return Product.updateOne(
              { _id: new mongoose.Types.ObjectId(product.id) },
              {
                $inc: {
                  "stock.qtyInStock": product.qty,
                  "stock.qtySold": -product.qty,
                },
              }
            );
          });
        }
        this.shippingStatus = "Cancelled";

        const data = await Promise.all([this.save(), ...productUpdate]);
      },
    },
    statics: {
      async placeOrder({
        products,
        discount,
        userId,
        adresses,
      }: {
        products: { id: string; qty: number }[];
        discount: {
          type: "PERCENT" | "VALUE";
          value: number;
        };
        userId: Types.ObjectId;
        adresses: {
          shippingAdress: Adress;
          billingAdress: Adress;
        };
      }): Promise<Document> {
        /* 
            -check the quantity of each product +++++
            -start transaction +++
            -place the order +++
            -place the order id to the user +++
            -update the qty of each product after ordering +++
            -close transaction
        */

        let session: ClientSession | null = null;

        try {
          //the session to start the transaction with
          session = await this.startSession();

          const [updatedProductsQueries, finalProducts] =
            await getProductsReadyForOrder(session, products);

          // new order
          const order = new this({
            products: finalProducts,
            timeSchduale: {
              placementDate: new Date(),
              expectedDeliveryDate: expectDelivery(),
              deliveredAt: null,
            },
            totalPrice: {
              currency: "LE",
              ...total(finalProducts, discount),
            },
            userId: userId,
            adresses: adresses,
          });
          if (process.env.ENVIRONMENT !== "DEVELOPMENT") {
            session.startTransaction();
          }

          const result = await Promise.all([
            Promise.all(updatedProductsQueries),
            order.save({ session: session }),
            User.updateOne(
              { _id: userId },
              {
                $push: {
                  orders: order.id,
                },
              }
            ).session(session),
          ]);

          console.log(
            result,
            `<-- the result of await Promise.all([
            Promise.all(updatedProductsQueries),
            order.save({ session: session }),
            User.updateOne(
             { _id: userId },
             {
               $push: {
                 orders: order.id,
               },
             }
           ).session(session),
         ]);`
          );
          if (process.env.ENVIRONMENT !== "DEVELOPMENT") {
            await session.commitTransaction();
          }
          return result[1];
        } catch (err) {
          if (process.env.ENVIRONMENT !== "DEVELOPMENT") {
            if (session) await session.abortTransaction;
          }
          throw err;
        } finally {
          if (process.env.ENVIRONMENT !== "DEVELOPMENT") {
            if (session) session?.endSession();
          }
        }
      },
    },
  }
);

export const Order = model<OrderIn, OrderModelIn>("Order", orderSchema);

// functions to be moved to another file
// expect delivery time
function expectDelivery(): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
}

// calculate total price
function total(
  products: ProductIn[],
  discount: {
    type: "PERCENT" | "VALUE";
    value: number;
  }
): {
  value: number;
  valAftDisc: number;
} {
  const total = products.reduce(
    (prev, curr) => prev + curr.price.value * curr.qty,
    0
  );
  return {
    valAftDisc: applyDiscount(total, discount.value, discount.type),
    value: total,
  };
}

//abstract the product checking in the database and making queries to update the products qty
async function getProductsReadyForOrder(
  session: ClientSession,
  products: { id: string; qty: number }[]
): Promise<[Promise<Document<unknown, any, FullPRoductIn>>[], ProductIn[]]> {
  // queries of pruduct model to be updated
  const updatedProductsQueries: Promise<
    Document<unknown, any, FullPRoductIn>
  >[] = [];

  // final products readuy to be added to the order document
  const finalProducts: ProductIn[] = [];

  //insufficient product if existed to return an informative error message
  const insufficientproducts: { id: string; qty: number }[] = [];

  for (let product of products) {
    const dbProduct = await getDbProduct(product.id);

    if (product.qty <= dbProduct.stock.qtyInStock) {
      dbProduct.stock.qtyInStock -= product.qty;
      dbProduct.stock.qtySold += product.qty;
      updatedProductsQueries.push(dbProduct.save({ session: session }));

      const productPrice = applyDiscount(
        dbProduct.price.price,
        dbProduct.discount?.discount,
        dbProduct.discount?.type
      );

      finalProducts.push({
        id: product.id,
        image: dbProduct.images.thumbnail,
        name: dbProduct.name,
        price: {
          value: productPrice,
          currency: dbProduct.price.currency,
        },
        qty: product.qty,
        totalPrice: productPrice * product.qty,
      });
    } else {
      insufficientproducts.push({
        id: product.id,
        qty: dbProduct.stock.qtyInStock,
      });
    }
  }
  if (insufficientproducts.length > 0) {
    throw new OrderError(
      `there is no sufficient stock for these products '${insufficientproducts
        .map((prod) => prod.id)
        .join("-")}'`,
      insufficientproducts
    );
  }
  return [updatedProductsQueries, finalProducts];
}

//
async function getDbProduct(id: string) {
  const dbProduct = await Product.findById(id).select(
    "stock price discount images name"
  );
  // notify the user that this product does not exist in the first place
  if (!dbProduct) {
    throw new OrderError(
      `product with the id of ${id} does not exist in the db`,
      [{ id: id, qty: 0 }]
    );
  }
  return dbProduct;
}