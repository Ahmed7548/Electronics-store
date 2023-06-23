import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ["PERCENTAGE", "VALUE"],
  },
  discountValue: {
    type: Number,
    required: true,
  },
  expiredAt:{
    type:Date,
    required : true
  }
},
{
    methods :{
        isExpired() : boolean {
            return Date.now()>= this.expiredAt.getTime()
        }
    }
});

export const Coupon = mongoose.model("Coupon", couponSchema);