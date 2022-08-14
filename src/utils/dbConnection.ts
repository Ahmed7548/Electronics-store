import {connect} from "mongoose";
 

const connectToDB = async (cb:Function): Promise<void> => {
  try {
    await connect(process.env.DBURI as string, {
      autoIndex: true,
    autoCreate:true})
      cb()
  } catch (err) {
    console.log(err)
  }
}


export default connectToDB