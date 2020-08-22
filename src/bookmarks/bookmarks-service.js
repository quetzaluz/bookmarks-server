const BookmarksService = {
    getAllBookmarks(knex) {
        return knex
            .select('*')
            .from('bookmarks_list')
    },
    getById(knex, id) {
        return knex
            .from('bookmarks_list')
            .select('*')
            .where('id', id)
            .first()
    },
    insertBookmarks(knex, newBookmark) {
        return knex 
            .insert(newBookmark)
            .into('bookmarks_list')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteBookmark(knex, id) {
        return knex('bookmarks_list')
            .where({ id })
            .delete()
    },
    updateBookmark(knex, id, newBookmarkFields) {
        return knex('bookmarks_list')
            .where({ id })
            .update(newBookmarkFields)
    },
}

module.exports = BookmarksService