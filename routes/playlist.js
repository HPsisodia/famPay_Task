const express = require('express');
const router = express.Router();

const { playlist, video, getAllVideo, getVideo } = require("./../controllers/playlist");

router.post('/playlist', playlist);
router.post('/video', video);
router.get('/getallvideo', getAllVideo);
router.get('/getvideo', getVideo);

module.exports = router;