function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'First test bookmark!',
            url: 'http://example.com/',
            rating: '5',
            description: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 2,
            title: 'Second test bookmark!',
            url: 'http://example.com/',
            rating: '3',
            description: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 3,
            title: 'Third test bookmark!',
            url: 'http://example.com/',
            rating: '4',
            description: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 4,
            title: 'Fourth test bookmark!',
            url: 'http://example.com/',
            rating: '4',
            description: 'Lorem ipsum dolor sit amet'
        },
    ]
}

module.exports = {
    makeBookmarksArray,
}