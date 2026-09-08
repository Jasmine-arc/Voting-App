const AccountModel = require("../model/account.model");

exports.create = async (info) => {
    try {
        return await AccountModel.create({ ...info })

    } catch (error) {
        return { error: error.message }
    }
};

exports.findByEmail = async (email) => {
    try {
        return await AccountModel.findOne({ email });
    } catch (error) {
        return { error: error.message };
    }
};

exports.findByRefreshToken = async (refreshToken) => {
    try {
        return await AccountModel.findOne({ refreshToken });
    } catch (error) {
        return { error: error.message };
    }
};

exports.updaterefreshToken = async (_id, refreshToken) => {
    try {
        const exist = await AccountModel.findById(_id);
        if (!exist) return { error: "Account does not exist" };
        exist.refreshToken = refreshToken;
        await exist.save();
        return exist;
    } catch (error) {
        return { error: error.message };
    }
};