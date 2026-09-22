const { login, register, forgotPassword, getAccounts, deleteAcc, logout,  refreshToken, check, updatePassword  } = require("../controllers/auth.controllers")


const authRouter = require("express").Router();

authRouter
.post("/register",  register )
.post("/login", login)
.post("/password", forgotPassword)
.get("/account", getAccounts)
.delete("/account/:email", deleteAcc)
.post("/logout", logout)
.get("/refresh", refreshToken)
.post("/check", check)
.post("/update", updatePassword)


module.exports = authRouter