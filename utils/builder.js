exports.buildResponse = (info) =>{
    const {password, refreshToken, _id,__v, ...rest} = info
    rest.userid = _id
    return rest;
}