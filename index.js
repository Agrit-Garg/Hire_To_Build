const mongoose=require("mongoose");
mongoose
// .connect("mongodb+srv://hiretobuild:hardwarebuilder2002@cluster0.dwbedbc.mongodb.net/?retryWrites=true&w=majority"
.connect("mongodb://127.0.0.1:27017/pleasemakedb"
// ,{
//     useUnifiedTopology: true,
//     autoIndex: true,
//mongodb://127.0.0.1:27017/pleasemakedb"
// }
)
.then(()=>console.log("Mongodb Connected"))
.catch(err=>console.log("Mongo Error",err));

const express=require("express");
const app=express();

//for user routes
const userRoute =require('./routes/userRoute');
app.use('/',userRoute);

app.listen(3000,function(){
    console.log("Server is running..");
}); 

