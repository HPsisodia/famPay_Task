const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cron = require('node-cron');
const { video } = require('./controllers/playlist')

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(helmet());


const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 7 requests,
  });
  app.use(limiter);



var task = cron.schedule('* * * * *', (req,res) => {
    video(req,res);
});
///////Importing routes

const playlistRoutes = require("./routes/playlist");

app.use('/api',playlistRoutes);


const PORT = 3000;
const DBURL = "mongodb://localhost:27017/fampay"

mongoose
  .connect(DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`Application is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });  