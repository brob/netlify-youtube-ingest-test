require('dotenv').config()
const axios = require('axios')
const YOUTUBE_KEY = process.env.YOUTUBE_KEY
const algolia = require('algoliasearch')
const client = algolia(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY)


const handler = async (event) => {
  try {
    const {videoUrl, index=false} = event.queryStringParameters
    // get id from youtube url
    const id = videoUrl.split('v=')[1].split('&')[0]
   
    const fetchUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_KEY}&part=snippet,statistics&id=${id}`
    const videoData = await axios.get(fetchUrl)
    const {items: videos} = videoData.data
    const {snippet, statistics} = videos[0]
    const {title, description, thumbnails} = snippet
    const {viewCount, likeCount, favoriteCount, commentCount} = statistics
    const dataForIndex = {
      title,
      description,
      thumbnail: thumbnails.high.url,
      publishDate: snippet.publishedAt,
      viewCount,
      likeCount,
      favoriteCount,
      commentCount,
      videoUrl,
      tags: snippet.tags,
      objectID: id
    }
    if (index) {
      // Index the videos to algolia
      const index = client.initIndex(process.env.VIDEO_INDEX)
      // save or update the videos in index
      try {
        const response = await index.saveObjects([dataForIndex])
        console.log(response)
        return {
          statusCode: 200,
          body: JSON.stringify(dataForIndex)
        }
      } catch(err) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Error saving videos to algolia' + JSON.stringify(err)
          })
        }
      }   
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify(dataForIndex)
      }
    }   
  } catch (error) {
    console.log(error)
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
