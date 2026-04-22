const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to db");
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = connectDB;
