const dbService = require('../../services/mongodb.service')
const alsService = require('../../services/als.service')
//logger
const ObjectId = require('mongodb').ObjectId

const gLabels = ["On wheels", "Box game", "Art", "Baby", "Doll", "Puzzle", "Outdoor"] /* FIX - make a collection in mongo */

const COLLECTION_NAME = 'robot'
const PAGE_SIZE = 30

module.exports = {
    getLabels,
    query,
    getById,
    add,
    update,
    remove,
    addToChat,
}

function getLabels() {
    return Promise.resolve(gLabels.sort())
}

async function query(filterBy) {

    const criteria = {}
    const { name, labels, inStock, owner, sortBy } = filterBy

    if (name) {
        const regex = new RegExp(name, 'i')
        criteria.name = { $regex: regex }
    }

    if (inStock !== undefined && inStock !== 'all') {
        criteria.inStock = inStock === 'true'
    }

    if (labels && labels.length > 0) {
        criteria.labels = { $in: labels } //in creates an OR query. At least one elements has to be in database array
        // criteria.labels = { $all: labels } //in creates an AND query. All the elements has to be in database array
    }

    if (owner) {
        criteria['owner._id'] = ObjectId(JSON.parse(owner)._id)
    }

    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        let robots = await collection.find(criteria)
        if (sortBy) robots.collation({ locale: 'en' }).sort({ [sortBy]: 1 }) //collation make it case insensitive

        robots = await robots.toArray()

        /* Since I created fake createdAt times, I don't use these lines. It's here as a reference  */
        // toys = toys.map(toy => {
        //     toy.createdAt = ObjectId(toy._id).getTimestamp()
        //     return toy
        // })


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
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const robot = collection.findOne({ _id: ObjectId(robotId) })

        /* Since I created fake createdAt times, I don't use these lines. It's here as a reference  */
        // robot.createdAt = ObjectId(robot._id).getTimestamp()

        return robot
    } catch (err) {
        console.log(`ERROR: cannot find robot ${robotId} (robot.service - getById)`)
        throw err
    }
}

async function add(robot) {
    try {
        const { loggedInUser } = alsService.getStore()
        const collection = await dbService.getCollection(COLLECTION_NAME)

        const newRobot = {
            name: robot.name,
            img: robot.img,
            price: robot.price,
            labels: robot.labels,
            inStock: robot.inStock,
            owner: {
                _id: ObjectId(loggedInUser._id),
                fullname: loggedInUser.fullname
            },
            createdAt: Date.now(),
        }

        const res = await collection.insertOne(newRobot)
        if (!res.insertedId) return null //will cause error 401
        newRobot._id = res.insertedId
        return newRobot
    } catch (err) {
        console.log('ERROR: cannot add robot (robot.service - add)')
        throw err
    }
}

async function update(robot) {
    try {
        const criteria = { _id: ObjectId(robot._id) }
        const { loggedInUser } = alsService.getStore()
        //only the owner of the robot, or admin, can update the robot
        if (!loggedInUser.isAdmin) criteria['owner._id'] = ObjectId(loggedInUser._id)

        const collection = await dbService.getCollection(COLLECTION_NAME)
        const lastModified = Date.now()

        const res = await collection.updateOne(
            criteria,
            {
                $set: {
                    name: robot.name,
                    img: robot.img,
                    price: robot.price,
                    labels: robot.labels,
                    inStock: robot.inStock,
                    lastModified
                }
            }
        )

        if (!res.modifiedCount) return null //will cause error 401
        return { ...robot, lastModified }
    } catch (err) {
        console.log(`ERROR: cannot update robot ${robot._id} (robot.service - update)`)
        throw err
    }
}

async function remove(robotId) {
    try {
        const criteria = { _id: ObjectId(robotId) }
        const { loggedInUser } = alsService.getStore()
        //only the owner of the robot, or admin, can remove the robot
        if (!loggedInUser.isAdmin) criteria['owner._id'] = ObjectId(loggedInUser._id)

        const collection = await dbService.getCollection(COLLECTION_NAME)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        console.log(`ERROR: cannot remove robot ${robot._id}`)
        throw err
    }
}

async function addToChat(robotId, msg) {
    try {
        console.log('robotId', robotId)
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const res = await collection.updateOne({ _id: ObjectId(robotId) }, { $push: { chat: msg } })
        console.log('res', res)
    } catch (err) {
        console.log(`ERROR: cannot add to chat of robot ${robot._id} (robot.service - remove)`)
        throw err
    }
}