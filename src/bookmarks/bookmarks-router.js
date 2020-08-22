const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { bookmarks } = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, rating, desc } = req.body;
    // validate that required keys exist
    if(!title) {
        logger.error(`Title is required.`);
        return res
            .status(400)
            .send('Invalid data.');
    }
    if(!url) {
        logger.error(`URL is required.`);
        return res
            .status(400)
            .send('Invalid data.');
    }
    if(!rating) {
        logger.error(`Rating is required.`);
        return res
            .status(400)
            .send('Invalid data.');
    }
    // get an id
    const id = uuid();

    const bookmark = {
        id,
        title,
        url,
        rating,
        desc
    };
    // add new bookmark to bookmarks array
    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created.`);

    res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json(bookmark);
    })

bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, req.params.bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.json(bookmark)
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);
        // findIndex method returns -1 if no element in array passes test
        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res  
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);
        res 
            .status(204)
            .end();
    })

module.exports = bookmarksRouter