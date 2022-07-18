const { ObjectId } = require('mongodb')
const dbService = require('../../services/mongodb.service')

const COLLECTION_NAME = 'review'

module.exports = {
    query,
    getById,
    add,
    update,
    remove
}

async function query(filterBy) {
    try {
        /* FIX - use filterBy to make aggregation */
        const collection = await dbService.getCollection(COLLECTION_NAME)
        let reviews = await collection.find({})
        reviews = await reviews.toArray()
        return reviews
    } catch (err) {
        console.log(`ERROR: cannot find reviews (robot.service - query)`)
        throw err
    }
}

async function getById(reviewId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const review = collection.findOne({ _id: ObjectId(reviewId) })
        review.createdAt = ObjectId(review._id).getTimestamp()
        return review
    } catch (err) {
        console.log(`ERROR: cannot find review ${reviewId} (review.service - getById)`)
        throw err
    }
}

async function add(review, loggedInUser) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)

        const newReview = {
            userId: loggedInUser._id,
            robotId: review.robotId,
            title: review.title,
            rate: review.rate,
            content: review.content
        }

        const res = await collection.insertOne(newReview)
        if (!res.acknowledged) return null //will cause error 401
        newReview._id = res.insertedId
        return newReview
    } catch (err) {
        console.log(`ERROR: cannot add review ${reviewId} (review.service - add)`)
        throw err
    }
}

async function update(review) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const lastModified = Date.now()

        const updatedReview = {
            robotId: review.robotId,
            title: review.title,
            rate: review.rate,
            content: review.content,
            lastModified
        }
        const res = await collection.updateOne({ _id: ObjectId(review._id) }, { $set: { ...updatedReview } })
        if (!res.modifiedCount) return null //will cause error 401
        return { ...review, lastModified }
    } catch (err) {
        console.log(`ERROR: cannot update review ${reviewId} (review.service - update)`)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId(reviewId) })
        return deletedCount
    } catch (err) {
        console.log(`ERROR: cannot delete review ${reviewId} (review.service - delete)`)
        throw err
    }
}