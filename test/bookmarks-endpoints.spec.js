const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks_list').truncate())

    afterEach('cleanup', () => db('bookmarks_list').truncate())

    describe('GET /bookmarks', () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 200 and an empty list`, () =>{
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200,[])
            })
        })
        
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
    
            beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks_list')
                .insert(testBookmarks)
            })
    
            it('responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })
        })

        context(`Given an XSS attack bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

            beforeEach('insert malicious bookmark', () => {
                return db
                    .into('bookmarks_list')
                    .insert([ maliciousBookmark ])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/bookmarks`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedBookmark.title)
                        expect(res.body[0].description).to.eql(expectedBookmark.description)
                    })
            })
        })
    })

    describe('GET /bookmarks/:id', () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404 if bookmark doesn't exist`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks_list')
                    .insert(testBookmarks)
            })

            it('responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })
    })

    describe(`POST /bookmarks`, () => {
        it(`responds with 400 missing 'title' if not provided`, () => {
            const newBookmarkMissingTitle = {
                url: 'http://example.com/',
                rating: 5,
            }
            return supertest(app)
                .post('/bookmarks')
                .send(newBookmarkMissingTitle)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, { error: { message: `'title' is required` } })
        })

        it(`responds with 400 missing 'url' if not provided`, () => {
            const newBookmarkMissingUrl = {
                title: 'Test new bookmark',
                rating: 5,
            }
            return supertest(app)
                .post('/bookmarks')
                .send(newBookmarkMissingUrl)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, { error: { message: `'url' is required` } })
        })

        it(`responds with 400 missing 'rating' if not provided`, () => {
            const newBookmarkMissingRating = {
                title: 'Test new bookmark',
                url: 'http://example.com/',
            }
            return supertest(app)
                .post('/bookmarks')
                .send(newBookmarkMissingRating)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, { error: { message: `'rating' is required` } })
        })

        it(`responds with 400 invalid if 'rating' is not between 0 and 5`, () => {
            const newBookmarkInvalidRating = {
                title: 'Test new bookmark',
                url: 'http://example.com/',
                rating: 'invalid',
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkInvalidRating)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, { error: { message: `'rating' must be a number between 0 and 5` } })
        })

        it(`responds with 400 invalid if 'url' is not a valid URL`, () => {
            const newBookmarkInvalidUrl = {
                title: 'Test new bookmark',
                url: 'invalid',
                rating: 5,
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkInvalidUrl)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, { error: { message: `'url' must be a valid URL` } })
        })

        it(`creates a bookmark, responding with 201 and the new bookmark`, function() {
            this.retries(3)
            const newBookmark = {
                title: 'Test new bookmark',
                url: 'http://example.com/',
                rating: 5,
                description: 'Test description.'
            }

            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)    
                )
        })

        it('removes XSS attack content from response', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
            return supertest(app)
                .post(`/bookmarks`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(maliciousBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                    expect(res.body.description).to.eql(expectedBookmark.description)
                })
        })
    })

    describe(`DELETE /bookmarks/:id`, () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404 when no bookmark exists`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })

        context(`Given there are bookmarks in the database`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db   
                    .into('bookmarks_list')
                    .insert(testBookmarks)
            })

            it('responds with 204 and removes the bookmark', () => {
                const idToRemove = 2
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/bookmarks`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmarks)    
                    )
            })
        })
    })
})