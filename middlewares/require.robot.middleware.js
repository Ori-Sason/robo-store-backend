// const logger = require('../services/logger.service')
const authService = require('../api/auth/auth.service.mongodb')
const cookieName = require('../api/auth/auth.controller').COOKIE_NAME
const robotService = require('../api/robot/robot.service.mongodb')

module.exports = {
    requireRobotOwnerOrAdmin
}

async function requireRobotOwnerOrAdmin(req, res, next) {
    if (!req?.cookies?.[cookieName]) return res.status(401).send('Not Authenticated')

    const loggedInUser = authService.validateToken(req.cookies[cookieName])
    const robotId = req.body._id || req.params.robotId
    const robot = await robotService.getById(robotId)

    if (!loggedInUser.isAdmin && loggedInUser._id !== robot.owner._id.toString()) {
        // logger.warn(`${loggedInUser.fullname} attempted to edit another user robot`)
        res.status(403).end('Not Authorized')
        return
    }

    next()
}