// const logger = require('../services/logger.service')
const authService = require('../api/auth/auth.service.mongodb')
const cookieName = require('../api/auth/auth.controller').COOKIE_NAME

module.exports = {
    requireUserPasswordOrAdmin
}


async function requireUserPasswordOrAdmin(req, res, next) {
    if (!req.cookies?.[cookieName]) return res.status(401).send('Not Authenticated')

    const loggedInUser = authService.validateToken(req.cookies[cookieName])

    if (loggedInUser.isAdmin) return next()
    if (loggedInUser.username !== req.body.username) return res.status(403).end('Not Authorized')

    const { password } = req.body

    try {
        await authService.login(loggedInUser.username, password)
    } catch (err) {
        // logger.warn(`${loggedInUser.fullname} attempted to edit another user`)
        return res.status(401).end('Wrong password')
    }

    next()
}