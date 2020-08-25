const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    rating: Number(bookmark.rating),
    description: xss(bookmark.description),
})

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, rating, description } = req.body

        for (const [key, value] of Object.entries({ title, url, rating })) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `'${key}' is required` }
                })
            }
        }
        
        const ratingNum = Number(rating)

        if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send({
                error: { message: `'rating' must be a number between 0 and 5` }
            })
        }
      
          if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send({
                error: { message: `'url' must be a valid URL` }
            })
        }

        const newBookmark = { title, url, rating, description }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            logger.info(`Bookmark with id ${bookmark.id} created.`)
            res
                .status(201)
                .location(`/bookmarks/${bookmark.id}`)
                .json(serializeBookmark(bookmark))
        })
        .catch(next)
    })
        

bookmarksRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.bookmark = bookmark // save the bookmark for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })  

module.exports = bookmarksRouter