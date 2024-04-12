import mongoose from"mongoose";
import  db_name  from "../constants.js";
const connectDB = async () => {
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`)
       console.log(`mongodb connnected !!DB host : ${connectionInstance}::${ connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongodb error",error);
        process.exit(1)
    }
}
export default connectDB;