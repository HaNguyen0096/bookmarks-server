const express = require('express')
const uuid = require('uuid/v4')
const { isWebUri } = require('valid-url')
const logger = require('./logger')
const {bookmarks} = require('./store')
const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body

    if (!title) {
      logger.error(`Title is required`);
      return res
        .status(400)
        .send('Invalid data');
    }
      
    if (!url) {
      logger.error(`Url is required`);
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!rating) {
        logger.error(`Rating is required`);
        return res
          .status(400)
          .send('Invalid data');
    }

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating`)
      return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url`)
      return res.status(400).send(`'url' must be a valid URL`)
    }

    const bookmark = { 
        id: uuid(), 
        title, 
        url, 
        description, 
        rating 
    }

    bookmarks.push(bookmark)

    logger.info(`Bookmark with id ${bookmark.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark)
  })

bookmarksRouter
  .route('/bookmarks/:bookmarkId')
  .get((req, res) => {
    const { bookmarkId } = req.params

    const bookmark = bookmarks.find(b => b.id == bookmarkId)

    if (!bookmark) {
      logger.error(`Bookmark with id ${bookmarkId} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }
    res.json(bookmark)
  })
  .delete((req, res) => {
    const { bookmarkId } = req.params

    const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId)

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${bookmarkId} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    bookmarks.splice(bookmarkIndex, 1)

    logger.info(`Bookmark with id ${bookmarkId} deleted.`)
    res
      .status(204)
      .send(`Bookmark with id ${bookmarkId} deleted.`)
      .end()
  })

module.exports = bookmarksRouter
