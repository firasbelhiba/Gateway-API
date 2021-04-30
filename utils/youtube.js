const axios = require('axios');
const config = require('config');

axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
        part: 'snippet',
        maxResults: 5,
        key: config.get('YOUTUBE_KEY')
    }
})
