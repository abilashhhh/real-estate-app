import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config()

const app = express();

mongoose.connect(process.env.MONGO).then(() => {
    console.log("Connected to mongodb")
}).catch((err) => {
    console.log("Error connecting to mongodb: ", err)
})

app.get('/', (req, res) => {
    res.send("Server running")
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
 