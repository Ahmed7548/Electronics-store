export const applyDiscount= (price:number,discount?:number,discountType?:"VALUE" | "PERCENT"):number=>{
    if(!discount || !discountType){
        return price
    }
    if(discountType==="PERCENT"){
        return price- (price*discount/100)
    }else {
        return price-discount
    }
}