// const { create, deleteFile, getAll } = require("../controller/appController")

const authRouter = require("./auth.router")

const appRouter = require("express").Router()


appRouter.use("/auth", authRouter)

module.exports = appRouter;