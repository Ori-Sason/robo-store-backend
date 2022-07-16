const dbService = require('../../services/mongodb.service')

const COLLECTION_NAME = 'user'

module.exports = {
    getByUsername,
    add,
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        // logger.error(`cannot find user ${username}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const newUser = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            isAdmin: false
        }
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const user = await collection.insertOne(newUser)
        return newUser
    } catch (err) {
        // logger.error('cannot add user', err)
        throw err
    }
}