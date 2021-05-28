const mongoose = require('mongoose');
const schema = mongoose.Schema;

const playlistSchema = new schema({

    paylistId: {
        type: String,
    },
    noOfVideos: {
        type: String,
    },
    playlistDescription: {
        type: String,
    },
    playlistThumbnail: {
        type: String,
    },
    videoData: [{
        videoTitle:{
            type: String,
        },
        videoPublishedAt:{
            type: String,
        },
        videoURL: {
            type: String,
        },
        videoID: {
            type: String,
        },
        videoLength: {
            type: String
        },
        videoDescription: {
            type: String
        },
        videoThumbnail: {
            type: String
        }
    }]
});

const playlistModel = mongoose.model("playlist", playlistSchema);

module.exports = playlistModel;