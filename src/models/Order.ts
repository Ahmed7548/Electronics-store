import { Schema, Model, Types } from "mongoose";
import { Product } from "./Product";

interface ProductIn {
  productId: Types.ObjectId;
  image: string;
  name: string;
  price: { value: number; currency: string };
  qty: number;
  totalPrice: {
    value: number;
    currency: string;
  };
}

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
}

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
        productId: {
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
  },
  {
    methods: {},
    statics: {
      async placeOrder(products: ProductIn[], coupon: string, userId:Types.ObjectId) {
        /* 
            -check the quantity of each product 
            -start transaction
            -place the order 
            -place the order id to the user 
            -update the qty of each product after ordering 
            -close transaction
        */
       //check the quantity of each product 
       
      },
    },
  }
);
