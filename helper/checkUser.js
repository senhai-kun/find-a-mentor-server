const { UsersAccount } = require('../db/model');

module.exports = async (id) => {
    console.log(" Checking user... ");

    const user = await UsersAccount.findOne({ _id: id })
    
    return user ? user : false
}