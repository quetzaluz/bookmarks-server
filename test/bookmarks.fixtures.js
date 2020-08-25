function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'First test bookmark!',
            url: 'http://example.com/',
            rating: 5,
            description: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 2,
            title: 'Second test bookmark!',
            url: 'http://example.com/',
            rating: 3,
            description: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 3,
            title: 'Third test bookmark!',
            url: 'http://example.com/',
            rating: 4,
            description: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 4,
            title: 'Fourth test bookmark!',
            url: 'http://example.com/',
            rating: 4,
            description: 'Lorem ipsum dolor sit amet'
        },
    ]
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'http://example.com/',
        rating: 1,
        description: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
    }

    const expectedBookmark = {
        ...maliciousBookmark,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousBookmark,
        expectedBookmark,
    }
}

module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark,
}