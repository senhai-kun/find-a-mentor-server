const { UsersAccount } = require('../db/model');
const dbConn = require('../db/dbConn');

module.exports = async (id) => {
    console.log(" Checking user... ");
    await dbConn();

    const user = await UsersAccount.findOne({ _id: id })
    
    return user ? user : false
}