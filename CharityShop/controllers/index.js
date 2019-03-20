const homeHandler = require('./home')
const productHandler = require('./product')
const categoryHandler = require('./categoryHandler')
const userController = require('./userController')
const causeController = require('./causeController')
const eventController = require('./eventController')
const postController = require('./postController')
const commentController = require('./commentController')
const postCategoryController = require('./postCategoryController')

module.exports = {
    home: homeHandler,
    product: productHandler,
    category: categoryHandler,
    user: userController,
    cause: causeController,
    event: eventController,
    post: postController,
    comment: commentController,
    postCategory: postCategoryController
}