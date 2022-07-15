const dbService = require('../../services/mongodb.service')
//logger
const ObjectId = require('mongodb').ObjectId

const gLabels = ["On wheels", "Box game", "Art", "Baby", "Doll", "Puzzle", "Outdoor"] /* FIX - make a collection in mongo */

const COLLECTION_NAME = 'robot'

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
    const { name, labels, inStock, sortBy } = filterBy

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

        return robots

    } catch (err) {
        console.log(`ERROR: cannot find robots`)
        console.log('err', err)
        throw err
    }
}

async function getById(robotId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const robot = collection.findOne({ _id: ObjectId(robotId) })

        /* Since I created fake createdAt times, I don't use these lines. It's here as a reference  */
        // toy.createdAt = ObjectId(toy._id).getTimestamp()

        return robot
    } catch (err) {
        console.log(`ERROR: cannot find robot ${robotId}`)
        throw err
    }
}

async function add(robot) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)

        const newRobot = {
            name: robot.name,
            img: robot.img,
            price: robot.price,
            labels: robot.labels,
            inStock: robot.inStock,
            createdAt: Date.now(),
        }

        const res = await collection.insertOne(newRobot)
        if (!res.acknowledged) return null//will cause error 401
        newRobot._id = res.insertedId
        return newRobot
    } catch (err) {
        console.log('ERROR: cannot add robot')
        throw err
    }
}

async function update(robot) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const lastModified = Date.now()

        const res = await collection.updateOne(
            { _id: ObjectId(robot._id) },
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

        if (!res.acknowledged) return null //will cause error 401
        return { ...robot, lastModified }
    } catch (err) {
        console.log(`ERROR: cannot update robot ${robot._id}`)
        throw err
    }
}

async function remove(robotId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId(robotId) })
        return deletedCount
    } catch (err) {
        console.log(`ERROR: cannot remove robot ${robot._id}`)
        throw err
    }
}

async function addToChat(robotId, msg) {
    try {

    } catch (err) {
        console.log(`ERROR: cannot add to chat of robot ${robot._id}`)
        throw err
    }
}