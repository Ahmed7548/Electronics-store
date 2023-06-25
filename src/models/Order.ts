import {
  Schema,
  Model,
  Types,
  Document,
  NumberExpression,
  ClientSession,
  model,
} from "mongoose";
import { Product, ProductIn as FullPRoductIn } from "./Product";
import { Adress, AsyncReturnType } from "../types";
import OrderError from "../Errors/OrderError";
import { User } from "./User";
import { applyDiscount } from "../utils/helpers/priceAfterDiscount";

interface ProductIn {
  id: Types.ObjectId;
  qty: number;
  price: number;
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
}

interface OrderModelIn extends Model<OrderIn> {
  placeOrder: (
    this: OrderModelIn,
    payload: {
      products: ProductIn[];
      discount: number;
      userId: Types.ObjectId;
      adresses: {
        shippingAdress: Adress;
        billingAdress: Adress;
      };
    }
  ) => void;
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
        totalPrice: {
          value: Number,
          currency: String,
        },
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
  },
  {
    methods: {},
    statics: {
      async placeOrder({
        products,
        discount,
        userId,
        adresses,
      }: {
        products: { id: Types.ObjectId; qty: number }[];
        discount: number;
        userId: Types.ObjectId;
        adresses: {
          shippingAdress: Adress;
          billingAdress: Adress;
        };
      }) {
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
              currency: "EGP",
              ...total(finalProducts, discount),
            },
            userId: userId,
            adresses: adresses,
          });

          session.startTransaction();

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

          // await Promise.all(updatedProductsQueries);
          // await order.save({ session: session });
          // await User.updateOne(
          //   { _id: userId },
          //   {
          //     $push: {
          //       orders: order.id,
          //     },
          //   }
          // ).session(session);

          await session.commitTransaction();
        } catch (err) {
          if (session) await session.abortTransaction;
          throw err;
        } finally {
          if (session) await session?.endSession();
        }
      },
    },
  }
);

export const Order = model("Order", orderSchema);















// functions to be moved to another file
// expect delivery time
function expectDelivery(): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
}

// calculate total price
function total(
  products: ProductIn[],
  discount: number
): {
  value: number;
  valAftDisc: number;
} {
  const total = products.reduce(
    (prev, curr) => prev + curr.price * curr.qty,
    0
  );
  return { valAftDisc: total - discount, value: total };
}

//abstract the product checking in the database and making queries to update the products qty
async function getProductsReadyForOrder(
  session: ClientSession,
  products: { id: Types.ObjectId; qty: number }[]
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

    if (product.qty < dbProduct.stock.qtyInStock) {
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
        price: productPrice,
        qty: product.qty,
        totalPrice: productPrice * product.qty,
      });
    } else {
      insufficientproducts.push({
        id: product.id.toHexString(),
        qty: dbProduct.stock.qtyInStock,
      });
    }
  }
  if (insufficientproducts.length > 0) {
    throw new OrderError(
      `there is no sufficient stock for these products '${insufficientproducts.join(
        "-"
      )}'`,
      insufficientproducts
    );
  }
  return [updatedProductsQueries, finalProducts];
}

//
async function getDbProduct(
  id: Types.ObjectId
): Promise<
  Document<unknown, any, FullPRoductIn> &
    Omit<FullPRoductIn & { _id: Types.ObjectId }, never> &
    any
> {
  const dbProduct = await Product.findById(id).select(
    "stock price discount images name"
  );
  // notify the user that this product does not exist in the first place
  if (!dbProduct) {
    throw new OrderError(
      `product with the id of ${id} does not exist in the db`,
      [{ id: id.toHexString(), qty: 0 }]
    );
  }
  return dbProduct;
}
/* 
thoughts 
    depending on constraints of the schema can we remove the parts were we check for sufficient stock for the product ???


*/
