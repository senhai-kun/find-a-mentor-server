const User = require('../db/model');

module.exports = async (field) => {
    console.log(" Checking user... ");

    const user = await User.findOne(field)
    
    return user ? user : false
}