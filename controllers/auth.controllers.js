const { hashSync, compareSync } = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { buildResponse } = require("../utils/builder");
const filePath = path.join(__dirname, "../", "accounts.json")
const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/env");
const { findByEmail, create, findByRefreshToken } = require("../services/account.service");
const AccountModel = require("../model/account.model");

const register = async (req, res) => {
    try {
        const email = req.body.email;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const password = req.body.password

        // data validation and sanitisation
        if (!email) throw new Error("Email is required")
        if (!firstname) throw new Error("Firstname is required")
        if (!lastname) throw new Error("lastname is required")
        if (!password) throw new Error("Password is required")

        if (!email.includes("@")) throw new Error("Email is invaild")
        if (!isNaN(firstname)) throw new Error("Firstname should be only characters")
        if (firstname.length < 2) throw new Error("First name should be at least 3 characters")
        if (firstname.length > 30) throw new Error("First name should be not excede 30 characters")
        if (!isNaN(lastname)) throw new Error("Lastname should be only characters")
        if (lastname.length < 2) throw new Error(" Last name should be at least 3 characters")
        if (lastname.length > 30) throw new Error("Last name should be not excede 30 characters")

        if (password.length < 8) throw new Error("Password must be at least 8 characters")

        const hashedPassword = hashSync(password, 10)

        const users = {
            email,
            firstname,
            lastname,
            password: hashedPassword,
            type: "user",
        }
        //checks if file exists

        const emailExist = await findByEmail(email)
        if (emailExist) throw new Error("Email is not available")

        const save = create(users)
        if (!save) throw new Error("Registeration Failed, please try again")
        if (save?.error) throw new Error(save.error)
        // if (fs.existsSync(filePath)) {

        //     const readData = fs.readFileSync(filePath, "utf-8");
        //     const objData = JSON.parse(readData)


        //     const emailExist = objData.find(x => x.email === email)

        //     if (emailExist) return (res.status(400).json)({ error: "Email already exists" });
        //     objData.push(users)

        //     const save = fs.writeFileSync(filePath, JSON.stringify(objData), "utf-8")
        //     if (save) throw new Error(save)
        // } else {
        //     const save = fs.writeFileSync(filePath, JSON.stringify([users]), "utf-8")
        //     if (save) throw new Error(save)
        // };

        // res.status(200).json({
        //     message: "Registration Sucessful"
        // })
        res.status(200).json({ message: "Registration Sucessful" })
    } catch (error) {
        res.status(400).json({ error: error.message || "An error occured" })
    }
}


// create a forget password route



const forgotPassword = (req, res) => {
    try {
        const email = req.body.email

        if (!email) throw new Error("Email is required")
        if (!email.includes('@')) throw new Error("Invalid Email")
        const user = {
            email
        }
        if (user) {
            return res.status(200).json({ message: "If email exists, a reset link will be sent to you shortly" })
        }
    } catch (error) {
        res.status(400).json({ error: error.message || "An error occured" })
    }
};


const getAccounts = (req, res) => {
    try {
        const { search } = req.query
        const resData = [];

        if (fs.existsSync(filePath)) {
            let data = fs.readFileSync(filePath, "utf-8");
            data = JSON.parse(data);
            if (data.length === 0) return res.status(404).json({ error: "No record Found" });

            if (search) {
                const findUser = data.find(x => x.email.toLowerCase() === search.toLowerCase()
                    || x.firstname.toLowerCase() === search || x.lastname.toLowerCase() === search)
                if (!findUser) throw new Error("No record Found")
                const found = buildResponse(findUser)
                return res.status(200).json({ message: "Found", data: found })
            }

            data.forEach((cur) => {
                resData.push(buildResponse(cur))
            });

            res.status(200).json({ message: "Found", data: resData })
        } else {
            res.status(404).json({ error: "No account" })
        }

    } catch (error) {
        console.log(error);

        res.status(400).json({ error: error.message || "An error occured" })
    }
}

const deleteAcc = (req, res) => {
    try {

        //accept email
        const { email } = req.params;

        //check if email exist
        if (!email) throw new Error("Email is required");
        if (!email.includes("@")) throw new Error("invalid email")

        // check if the file exists
        if (fs.existsSync(filePath)) {

            let data = fs.readFileSync(filePath, "utf-8");

            data = JSON.parse(data);
            console.log(data);

            //ckeck if the file is empty
            if (data.length === 0) return res.status(404).json({ error: "No record Found" });

            //search for the user you want to remove
            const userExist = data.find(x => x.email.toLowerCase() === email.toLowerCase());
            if (!userExist) throw new Error("User does not exist");
            const others = data.filter(x => x.email.toLowerCase() !== email.toLowerCase())

            //store the result of the file writing operation
            const save = fs.writeFileSync(filePath, JSON.stringify(others), "utf-8")
            if (save) throw new Error(save)
            return res.status(200).json({ message: "Account Deleted Sucessfully" })

        } else res.status(400).json({ msg: "No account Found" })
    } catch (error) {
        res.status(400).json({ error: error.message || "An error occured" })
    }
};

const readFile = (filePath) => {
    let data;
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, "utf-8");
        data = JSON.parse(data);
        if (data.length === 0) throw new Error("No record found");
    }
    return data;
}

const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;


        if (!email) throw new Error("Email is required")
        if (!password) throw new Error("Password is required")

        if (!email.includes("@")) throw new Error("Email is invaild")

        if (password.length < 8 || password === "") throw new Error("Password must be at least 8 characters")
        if (password.length > 50) throw new Error("Password must not be more than 15 characters")


        let token = req?.cookies?.voTin_ex
        if (!token) token = req?.headers?.authorization?.split(' ')[1];
        if (!token) token = req.headers.cookie?.split("=")[1];
        if (token) return res.status(401).json({ msg: "You're already logged in" })

        const userExist = await findByEmail(email)
        if (!userExist) throw new Error("Account does not exist");

        if (!compareSync(password, userExist.password)) throw new Error("Incorrect Password")

        const payLoad = {
            id: userExist._id,
            email,
            userType: userExist.type
        }
        const userData = buildResponse(userExist.toObject())


        //sign token
        const accessToken = jwt.sign(payLoad, CONFIG.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
        const refreshToken = jwt.sign(payLoad, CONFIG.REFRESH_TOKEN_SECRET, { expiresIn: "2m" })
        userExist.refreshToken = refreshToken;
        userExist.save();

        res.cookie("voTin_ex", accessToken, {
            httpOnly: false,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 1000,

        });

        res.status(200).json({
            message: "Login Sucessful",
            data: userData,
            token: accessToken, refreshToken
        })

    } catch (error) {
        res.status(400).json({ error: error.message || "An error occured" })

    }
}


const logout = async (req, res) => {
    try {
        let token = req?.cookies?.voTin_ex
        if (!token) token = req?.headers?.authorization?.split(' ')[1];
        if (!token) token = req.headers.cookie?.split("=")[1];

        if (!token) return res.status(401).json({ msg: "You're already logged out" })
        const verify = jwt.verify(token, CONFIG.ACCESS_TOKEN_SECRET)
        console.log(verify);

        if (!verify) return res.status(401).json({ message: "Generate new Access Token" })

        const userExist = await AccountModel.findById(verify._id)
        if (!userExist) throw new Error("Account does not exist");
        if (userExist?.refreshToken) {
            userExist.refreshToken = "";

            res.clearCookie("voTin_ex")

        } else throw new Error({ message: "You have to log in first..." })
        res.status(200).json({ message: "Logout Successful" })

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Access token expired, generate new access token" })
        res.status(400).json({ error: error.message || "An error occured" })
    }
}


const refreshToken = async (req, res) => {
    try {

        let token = req?.cookies?.voTin_ex
        if (!token) token = req?.headers?.authorization?.split(' ')[1];
        if (!token) token = req.headers.cookie?.split("=")[1];

        const { refreshToken } = req.body
        if (!refreshToken) throw new Error("Refresh Token required")

        const data = readFile(filePath);
        if (!data) throw new Error("No record found")

        const userExist = data.find(x => x.refreshToken === refreshToken);
        let others = data.filter(x => x.refreshToken !== refreshToken);

        if (!userExist) {

            const check = jwt.decode(refreshToken, CONFIG.ACCESS_TOKEN_SECRET)
            const findUser = data.find(x => x.id === check.id)
            let others = data.filter(x => x.id !== check.id);

            if (findUser) {
                delete findUser.refreshToken;
                others.push(findUser);
                const save = fs.writeFileSync(filePath, JSON.stringify(others), "utf-8")
                if (save) throw new Error(save)
            }
            res.clearCookie("voTin_ex");
            return res.status(401).json({ error: "Token Reuse Detected" })


        } else {
            jwt.verify(refreshToken, CONFIG.REFRESH_TOKEN_SECRET, async (err, decode) => {
                if (err) {

                    delete userExist.refreshToken;
                    others.push(userExist);
                    const save = fs.writeFileSync(filePath, JSON.stringify(others), "utf-8")
                    if (save) throw new Error(save)
                    return res.status(401).json({ error: "please login" })
                }

            })
            const payload = {
                id: userExist.id,
                email: userExist.email,
                type: userExist.type
            }
            const accessToken = jwt.sign(payload, CONFIG.ACCESS_TOKEN_SECRET, { expiresIn: "1m" })
            res.clearCookie("voTin_ex");
            res.cookie("voTin_ex", accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: "none",
            })
            res.status(200).json({ message: "Access Token Generated Sucessfuly", token: accessToken })
        }

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Access token expired, generate new access token" })
        res.status(400).json({ errror: error.message || "An error occured" })
    }
}

const check = (req, res) => {
    try {

        let token = req?.cookies?.voTin_ex
        if (!token) token = req?.headers?.authorization?.split(' ')[1];
        if (!token) token = req.headers.cookie?.split("=")[1];
        if (!token) throw new Error("You have to login first");

        const data = readFile(filePath);
        if (!data) throw new Error("No record found")
        const verify = jwt.verify(token, CONFIG.ACCESS_TOKEN_SECRET)
        const userExist = data.find(x => x.id === verify.id)
        if (!userExist.refreshToken) {
            return res.status(401).json({ error: "Please login" })
        }
        res.status(200).json({ message: "Check successfull" });


    } catch (error) {
        if (error.name === "TokenExpiredError" || error.message === "You have to login first") {
            return res.status(401).json({ message: "Access token expired, generate new access token" })
        }
        res.status(400).json({ error: error.message || "An error occured" })
    }
}

module.exports = {
    register,
    login,
    forgotPassword,
    getAccounts,
    deleteAcc,
    logout,
    refreshToken,
    check
}

