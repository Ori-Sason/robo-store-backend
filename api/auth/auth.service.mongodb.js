const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Rob-123') /* FIX - add SECRET1 in production environment */

const bcrypt = require('bcrypt')
const userService = require('../user/user.service.mongodb')
// const logger = require('../../services/logger.service')

module.exports = {
    login,
    signup,
    getLoginToken,
    validateToken
}

async function login(username, password) {
    try {
        const user = await userService.getByUsername(username)
        if (!user) return Promise.reject('Invalid username or password')
        const match = await bcrypt.compare(password, user.password)
        console.log('match', match)
        if (!match) return Promise.reject('Invalid username or password')

        delete user.password
        return user
    } catch (err) {
        console.log(`ERROR: cannot find user (auth.service - login)`)
        console.log('err', err)
        throw err
    }
}

async function signup(username, password, fullname) {
    if (!username || !password || !fullname) return Promise.reject('fullname, username and password are required!')

    try {
        const saltRounds = 10
        const hash = await bcrypt.hash(password, saltRounds)
        return userService.add({ username, password: hash, fullname })
    } catch (err) {
        console.log(`ERROR: cannot signup user (auth.service - signup)`)
        throw err
    }
}

function getLoginToken(user) {
    return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {

}