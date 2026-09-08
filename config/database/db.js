const { connect } = require("mongoose");
const { CONFIG } = require("../env");

const connectDB = async () => {
    try {
        console.log("Connected to MongoDB");
        await connect(CONFIG.DB_URL);
        console.log("DataBase Connected Successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }
};
module.exports = { connectDB };