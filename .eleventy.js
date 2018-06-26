module.exports = {
    pathPrefix: '/',
    dir: {
        input: 'src/views',
        output: 'dist',
        data: '_data'
    },
    templateFormats: ['njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true
};
