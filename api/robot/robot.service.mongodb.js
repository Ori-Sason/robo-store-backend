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
    return Promise.resolve(gLabels)
}

async function query(filterBy) {

    const { sortBy } = filterBy

    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        let robots = await collection.find()
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

    } catch (err) {
        console.log(`ERROR: cannot find robot ${robotId}`)
        throw err
    }
}

async function add(robot) {
    try {

    } catch (err) {
        console.log('ERROR: cannot add robot')
        throw err
    }
}

async function update(robot) {
    try {

    } catch (err) {
        console.log(`ERROR: cannot update robot ${robot._id}`)
        throw err
    }
}

async function remove(robotId) {
    try {

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