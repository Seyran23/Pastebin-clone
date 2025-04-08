const bcrypt = require("bcrypt")

const saltRounds = 12

const hashingPassword = async (text) => {
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(text, salt)

    return hashedPassword
}

module.exports = hashingPassword