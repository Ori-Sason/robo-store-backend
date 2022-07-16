const express = require('express')
const { getUser } = require('./user.controller')

const router = express.Router()

module.exports = router

router.get('/:userId', getUser)