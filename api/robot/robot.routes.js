const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/require.auth.middleware')
//log
const { getLabels, getRobots, getRobotById, addRobot, updateRobot, removeRobot } = require('./robot.controller')
const router = express.Router()

module.exports = router

router.get('/labels', getLabels)
router.get('/', getRobots) //log
router.get('/:robotId', getRobotById)
router.post('/', requireAuth, requireAdmin, addRobot)
router.put('/', requireAuth, requireAdmin, updateRobot)
router.delete('/:robotId', requireAuth, requireAdmin, removeRobot)
