const { login, register, forgotPassword, getAccounts, deleteAcc, logout,  refreshToken, check  } = require("../controllers/auth.controllers")


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


module.exports = authRouter