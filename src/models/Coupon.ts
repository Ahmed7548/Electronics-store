import mongoose from "mongoose";



interface CouponIn{
  code : string;
  discountType: "PERCENT"|"VALUE";
  discountValue:number;
  expiredAt:Date;
  isExpired:()=>boolean
}

const couponSchema = new mongoose.Schema<CouponIn>({
  code: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ["PERCENT", "VALUE"],
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