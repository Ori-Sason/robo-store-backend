const dbService = require('../../services/sql.service')
const alsService = require('../../services/als.service')

const gLabels = ["On wheels", "Box game", "Art", "Baby", "Doll", "Puzzle", "Outdoor"]

const PAGE_SIZE = 30

module.exports = {
    getLabels,
    query,
    getById,
    add,
    update,
    remove,
    /* FIX - addToChat */
    /* FIX - getSTatistics */
}

function getLabels() {
    return Promise.resolve(gLabels.sort())
}


async function query(filterBy) {

    let criteriaCmds = []
    const { name, labels, inStock, owner, sortBy } = filterBy

    if (name) criteriaCmds.push(`robot.name LIKE '%${name}%'`)

    if (labels && labels.length > 0) {
        JSON.parse(labels).forEach(label => criteriaCmds.push(`robot.labels LIKE '%\"${label}\"%'`))
    }
    if (inStock) criteriaCmds.push(`robot.inStock = ${inStock}`)
    if (owner) criteriaCmds.push(`robot.ownerId = ${owner._id}`)

    let criteria = ''
    if (criteriaCmds.length) criteria = criteriaCmds.join(' AND ')

    try {
        let sqlCmd = `SELECT * FROM robot`
        if (criteria) sqlCmd += ' WHERE ' + criteria

        let robots = await dbService.runSQL(sqlCmd)
        robots.forEach(robot => robot.labels = JSON.parse(robot.labels))
        /* FIX - add owner full name from user table */

        let pageIdx = +filterBy.pageIdx
        const numOfPages = Math.ceil(robots.length / PAGE_SIZE)

        if (pageIdx < 0) pageIdx = numOfPages
        else if (pageIdx > numOfPages - 1) pageIdx = 0
        filterBy = { ...filterBy, pageIdx, numOfPages }

        robots = robots.slice(PAGE_SIZE * pageIdx, PAGE_SIZE * (pageIdx + 1))

        return { robots, filterBy }
    } catch (err) {
        console.log(`ERROR: cannot find robots (robot.service - query)`)
        console.log('err', err)
        throw err
    }
}

async function getById(robotId) {
    try {
        const sqlCmd = `SELECT * FROM robot WHERE robot._id = ${robotId}`
        const robot = await dbService.runSQL(sqlCmd)
        robot[0].labels = JSON.parse(robot[0].labels)
        return robot
    } catch (err) {
        console.log(`ERROR: cannot find robot ${robotId} (robot.service - getById)`)
        console.log('err', err)
        throw err
    }
}

async function add(robot) {
    try {
        const { loggedInUser } = alsService.getStore()

        const newRobot = {
            name: robot.name,
            price: robot.price,
            inStock: robot.inStock,
            labels: robot.labels,
            img: robot.img,
            ownerId: loggedInUser._id
        }

        const sqlCmd = `INSERT INTO robot (name, price, inStock, labels, img, ownerId)
            VALUES ("${newRobot.name}",
                    "${newRobot.price}",
                    "${newRobot.inStock}",
                    '${JSON.stringify(newRobot.labels)}',
                    "${newRobot.img}",
                    "${loggedInUser._id}"
            )`

        const res = await dbService.runSQL(sqlCmd)
        if (!res.insertId) return null //will cause error 401

        /* FIX - add owner full name from user table */

        newRobot._id = res.insertId
        return newRobot
    } catch (err) {
        console.log('ERROR: cannot add robot (robot.service - add)')
        console.log('err', err)
        throw err
    }
}

async function update(robot) {
    try {
        const { loggedInUser } = alsService.getStore()
        const lastModified = Date.now()

        let sqlCmd = `UPDATE robot set name="${robot.name}",
                                    img="${robot.img}",
                                    price="${robot.price}",
                                    labels='${JSON.stringify(robot.labels)}',
                                    inStock="${robot.inStock}",
                                    lastModified="${lastModified}"
                        WHERE robot._id=${robot._id}`

        //only the owner of the robot, or admin, can update the robot
        if (!loggedInUser.isAdmin) sqlCmd += ` AND robot.ownerId=${loggedInUser._id}`
        console.log('sqlCmd', sqlCmd)

        const res = await dbService.runSQL(sqlCmd)
        if (!res?.affectedRows) return null //will cause error 401
        return { robot, lastModified }
    } catch (err) {
        console.log(`ERROR: cannot update robot ${robot._id} (robot.service - update)`)
        console.log('err', err)
        throw err
    }
}

async function remove(robotId) {
    try {
        const { loggedInUser } = alsService.getStore()
        loggedInUser._id = 62

        let sqlCmd = `DELETE FROM robot WHERE robot._id=${robotId}`

        //only the owner of the robot, or admin, can update the robot
        if (!loggedInUser.isAdmin) sqlCmd += ` AND robot.ownerId=${loggedInUser._id}`

        const res = await dbService.runSQL(sqlCmd)
        if (!res?.affectedRows) return null //will cause error 401
        return res.affectedRows
    } catch (err) {
        console.log(`ERROR: cannot remove robot ${robot._id} (robot.service - remove)`)
        console.log('err', err)
        throw err
    }
}