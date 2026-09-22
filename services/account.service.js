const AccountModel = require("../model/account.model");
const { buildResponse } = require("../utils/builder");

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
        const exist = await AccountModel.findById({_id});
        if (!exist) return { error: "Account does not exist" };
        exist.refreshToken = refreshToken;
        await exist.save();
        return exist;
    } catch (error) {
        return { error: error.message };
    }
};

exports.findUsers = async (data) => {
    try {
        // console.log(data);
        
        if (data) {
            const findUser = await AccountModel.findOne({
                // console.log(findUser)
                $or: [
                    { email: data },
                    { firstname: data },
                    { lastname: data}
                ]
            });
    
            if (!findUser) throw new Error("Not found")
            const found = buildResponse(findUser);
            return { msg: "Found", data: found };
        }else{
            const allUsers = await AccountModel.find({});

            if(allUsers.length === 0) throw new Error (" No record ");
            const resData = allUsers.map(cur => buildResponse(cur));
            return resData;
        }
    } catch (error) {
        
        return { error: error.message };
    }
};