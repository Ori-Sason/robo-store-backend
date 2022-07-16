// const logger = require('../services/logger.service')
const authService = require('../api/auth/auth.service.mongodb')
const cookieName = require('../api/auth/auth.controller').COOKIE_NAME
const robotService = require('../api/robot/robot.service.mongodb')

module.exports = {
    requireAuth,
    requireAdmin,
    requireRobotOwnerOrAdmin
}

async function requireAuth(req, res, next) {
    if (!req?.cookies?.[cookieName]) return res.status(401).send('Not Authenticated')
    const loggedInUser = authService.validateToken(req.cookies[cookieName])
    
    if (!loggedInUser) return res.status(401).send('Not Authenticated')
    next()
}

async function requireAdmin(req, res, next) {
    if (!req?.cookies?.[cookieName]) return res.status(401).send('Not Authenticated')
    const loggedInUser = authService.validateToken(req.cookies[cookieName])

    if (!loggedInUser.isAdmin) {
        logger.warn(`${loggedinUser.fullname} attempted to perform admin action`)
        res.status(403).end('Not Authorized') //notice the end, which means that there are no following middlewares
        return
    }

    next()
}

async function requireRobotOwnerOrAdmin(req, res, next) {
    if (!req?.cookies?.cookieName) return res.status(401).send('Not Authenticated')

    const loggedInUser = authService.validateToken(req.cookies.cookieName)
    const robot = await robotService.getById(req.body._id)

    if (!loggedinUser.isAdmin && loggedInUser._id !== robot.owner._id) {
        logger.warn(`${loggedinUser.fullname} attempted to edit another user robot`)
        res.status(403).end('Not Authorized')
        return
    }

    next()
}