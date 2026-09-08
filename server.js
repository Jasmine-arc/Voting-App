const express = require("express");
const appRouter = require("./router/appRouter");
const { configDotenv } = require("dotenv");
const { CONFIG, WHITE_LIST } = require("./config/env");
const cors = require("cors");
const dbConnection = require("./config/database");

// const authRouter = require("./router/auth.router");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use(cors({
    origin: function(origin, cb){
        if(!origin || WHITE_LIST.includes(origin)){
            return cb(null, true)
        }else{
            return cb(new Error("Not allowed by CORS"))
        }
    },
    methods: ["POST","GET", "PUT","PATCH", "DELETE"],
    credentials: true,
}))


app.get("/status", (req, res) => {
    res.status(200).json({ msg: "Yes! Welcome to Voting Api"})
});
// WHENEVER YOU CALL CONFIG, IT WILL AUTOMATICALLY CALL THE CONFIGURATION FROM .ENV FILE(ENVIRONMENT VARIABLES).
const PORT = CONFIG.PORT || 5000;
app.use("/api", appRouter);


app.listen(PORT, async () => {
    await dbConnection.connectMongoDB();
    console.log(`Server is running on http://localhost:${PORT}`)
});