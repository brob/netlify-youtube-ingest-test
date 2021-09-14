require('dotenv').config()
const axios = require('axios')
const YOUTUBE_KEY = process.env.YOUTUBE_KEY
const algolia = require('algoliasearch')
const client = algolia(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY)


const handler = async (event) => {
  try {
    const {channelId, maxResults=20, index=false} = event.queryStringParameters
    const videoList = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_KEY}&type=video&maxResults=${maxResults}&q=&channelId=${channelId}&order=date`)
    const {items} = videoList.data
   
    const videoIds = items.map(item => item.id.videoId)
    const fetchUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_KEY}&part=snippet,statistics&id=${videoIds.join(',')}`
    const videoData = await axios.get(fetchUrl)
    const {items: videos} = videoData.data

    const normalizedVideos = videos.map(video => {
      const {snippet, statistics} = video
      return {
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high.url,
        publishDate: snippet.publishedAt,
        likes: statistics.likeCount,
        commentCount: statistics.commentCount,
        objectID: video.id,
        tags: snippet.tags
      }
    })
    if (index) {
      // Index the videos to algolia
      const index = client.initIndex(process.env.VIDEO_INDEX)
      // save or update the videos in index
      try {
        await index.saveObjects(normalizedVideos)
        return {
          statusCode: 200,
          body: JSON.stringify(normalizedVideos)
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
        body: JSON.stringify(normalizedVideos)
      }
    }
    
    
  } catch (error) {
    console.log(error)
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
