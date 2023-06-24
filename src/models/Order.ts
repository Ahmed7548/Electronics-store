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

interface ProductIn {
  id: Types.ObjectId;
  image: string;
  name: string;
  price: { value: number; currency: string };
  qty: number;
  totalPrice: {
    value: number;
    currency: string;
  };
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
  Products: ProductIn[];
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

const orderSchema = new Schema<OrderIn>(
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
    Products: [
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
      async placeOrder(
        products: ProductIn[],
        discount: number,
        userId: Types.ObjectId,
        adresses: {
          shippingAdress: Adress;
          billingAdress: Adress;
        }
      ) {
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
          //check the quantity of each product
          const updateProductsQueries: Promise<
            Document<unknown, any, FullPRoductIn>
          >[] = [];
          const insufficientproducts: { id: string; qty: number }[] = [];
          session = await this.startSession();
          for (let product of products) {
            const productStock = await Product.findById(product.id).select(
              "stock"
            );

            if (!productStock) {
              throw new OrderError(
                `product with the id of ${product.id} does not exist in the db`,
                [{ id: product.id.toHexString(), qty: 0 }]
              );
            }

            if (product.qty < productStock.stock.qtyInStock) {
              productStock.stock.qtyInStock -= product.qty;
              productStock.stock.qtySold += product.qty;
              updateProductsQueries.push(
                productStock.save({ session: session })
              );
            } else {
              insufficientproducts.push({
                id: product.id.toHexString(),
                qty: productStock.stock.qtyInStock,
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
          const order = new this({
            Products: products,
            timeSchduale: {
              placementDate: new Date(),
              expectedDeliveryDate: expectDelivery(),
              deliveredAt: null,
            },
            totalPrice: {
              currency: "EGP",
              ...total(products, discount),
            },
            userId: userId,
            adresses:adresses
          });

          session.startTransaction();

          await Promise.all(updateProductsQueries);
          await order.save({ session: session });
          await User.updateOne(
            { _id: userId },
            {
              $push: {
                orders: order.id,
              },
            }
          ).session(session);

          await session.commitTransaction();
        } catch (err) {
          if (session) await session.abortTransaction;
          throw err;
        } finally {
          if (session) session?.endSession();
        }
      },
    },
  }
);

const Order = model("Order", orderSchema);

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
    (prev, curr) => prev + curr.price.value * curr.qty,
    0
  );
  return { valAftDisc: total - discount, value: total };
}

/* 
thoughts 
    depending on constraints of the schema can we remove the parts were we check for sufficient stock for the product ???


*/
