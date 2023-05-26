import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { User } from "../../models/User";
import { AsyncCustomRequestHandler } from "../../types";


// interface respones {
//     categories:CategoryIn[];
//     products:
// }


// get all the categories and promoted products and user specific products 
// specific products is to be determined some time in the future
const getInitialData:AsyncCustomRequestHandler<any,{userId:string|undefined}>=async (req,res,next)=>{
    const {userId}=req.body

    const promotedProducts= Product.getPromated(10)
    const categories= Category.find()
    if(userId){
        const user = User.findById(userId,{verificationToken:0,verified:0,googleId:0,password:0})
        // get the categories and user specific data and promoted products

        const data=await  Promise.all([await user,await promotedProducts,await categories])

        res.status(200).json({
            user:data[0],
            promotedProducts:data[1],
            categories:data[2]
        })
    }else {
        const data=await  Promise.all([await promotedProducts,await categories])
        res.status(200).json({
            promotedProducts:data[0],
            categories:data[1]
        })
        //get the categories and promoted products
    }
}
