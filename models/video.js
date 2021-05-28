const mongoose = require('mongoose');
const schema = mongoose.Schema;

const videoSchema = new schema({

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
    videoDescription: {
        type: String
    },
    videoThumbnail: {
        type: String
    }
});

const videoModel = mongoose.model("video", videoSchema);

module.exports = videoModel;