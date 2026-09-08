const { Schema, Model, model } = require("mongoose");

const accountSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ["admin", "user"],
        default: "user",
    },
    refreshToken: {
        type: String,
        index: true,
    }
}, {
    timestamps: true,
})

const AccountModel = model("Account", accountSchema);

module.exports = AccountModel
