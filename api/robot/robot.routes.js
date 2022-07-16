const express = require('express')
const { requireAuth, requireAdmin, requireRobotOwnerOrAdmin } = require('../../middlewares/require.auth.middleware')
//log
const { getLabels, getRobots, getRobotById, addRobot, updateRobot, removeRobot } = require('./robot.controller')
const router = express.Router()

module.exports = router

router.get('/labels', getLabels)
router.get('/', getRobots) //log
router.get('/:robotId', getRobotById)
router.post('/', requireAuth, addRobot) //requireAdmin
router.put('/', requireRobotOwnerOrAdmin, updateRobot) //requireAuth, requireAdmin
router.delete('/:robotId', requireRobotOwnerOrAdmin, removeRobot) //requireAuth, requireAdmin
