const userService = require('./user.service.mongodb')

module.exports = {
    getUser
}

async function getUser(req, res) {
    try {
        const userId = req.params.userId
        const user = await userService.getById(userId)
        if (!user) return res.status(401).send('Failed to get user')
        res.send(user)
    } catch (err) {
        // logger.error('Failed to get robot', err)
        res.status(500).send({ err: 'Failed to get robot' })
    }
}