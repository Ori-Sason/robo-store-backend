const express = require('express')
//auth
//log
const { getLabels, getRobots, getRobotById, addRobot, updateRobot, removeRobot } = require('./robot.controller')
const router = express.Router()

module.exports = router

router.get('/labels', getLabels)
router.get('/', getRobots) //log
router.get('/:robotId', getRobotById)
router.post('/', addRobot) //auth, admin
router.put('/', updateRobot) //auth, admin
router.delete('/:robotId', removeRobot) //auth, admin
