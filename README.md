# Netlify function to index YouTube videos on Algolia

This is a quick script to index (or just grab JSON) for youtube videos.

## Installation

In your Netlify project, create (or use) your Netlify functions directory. If you don't have one, create a new directory:

```sh
mkdir /netlify/functions
```

Put the contents of `netlify/functions/getYoutube.js` into this directory.

Install the dependencies:

```sh
npm install algoliasearch axios dotenv
```

### Environment variables

The function requires environment variables to connect to the YouTube API and an Algolia index.

|variable|use|
|--------|---|
|`YOUTUBE_KEY`| Your API Key for [the YouTube API](https://developers.google.com/youtube/v3)|
|`ALGOLIA_APP_ID`| The Algolia app ID |
|`ALGOLIA_API_KEY`| Your Algolia API key. This needs write permissions to write to the index |
|`VIDEO_INDEX`| The Index name where your search index will be stored in Algolia |
 
## Usage

After installation, hit the following endpoint in your Netlify site:

`<siteURL>/.netlify/functions/getYoutube?channelID=<your channel id>&maxResults=<number of results>&index=<true/false to index>`

## Parameters 

|parameter|type|what it does|
|---|----|---|
| `channelId` | `string` | The ID of the YouTube channel to scrape |
| `maxResults` | `string` | How many results to return (this is ordered by date, so it will get "latest" `n` videos) |
| `index` | `boolean` | if `true` will submit the videos in the list to Algolia (using env variables) if `false` will just display JSON in the body of the response

