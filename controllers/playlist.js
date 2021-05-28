const playlistModel = require("./../models/playlist");
const videoModel = require("./../models/video");

require('dotenv').config()

const {
    statusCode,
    returnErrorJsonResponse,
    returnJsonResponse,
  } = require("../Helpers/status.js");


const axios = require("axios");

exports.video = async(req,res) => {
    try {

        const apikey = process.env.API_KEY || "";
        var query;
        if(req.body){
            query = req.body.query
        }else{
            query = "official";
        }

        ////generating the before and after date to be used in youtube API
        //// The api looks for video uploaded within the time frame of now and 2 min earlier
        var date = Date.now()
        var dateAfter = date - 120000;
        
        var dateBefore = new Date(date);
        dateBefore = dateBefore.toJSON()
        dateBefore = dateBefore.replace(/:/g, "%3A")

        dateAfter = new Date(dateAfter);
        dateAfter = dateAfter.toJSON()
        dateAfter = dateAfter.replace(/:/g, "%3A")

        let video = [];

        var videoDetails;
        


        ///If query is undefined or empty, it returns all the videos uploaded
        //Else if some query is present, it searches based on that 

        if(query == undefined || query == ""){
            
            videoDetails = await axios({
                method: "get",
                url:
                    `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=40&order=date&publishedAfter=${dateAfter}&publishedBefore=${dateBefore}&type=video&key=${apikey}`
            });

            console.log(videoDetails.data.items.length)
        }else{
            
            videoDetails = await axios({
                method: "get",
                url:
                    `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&order=date&publishedAfter=${dateAfter}&publishedBefore=${dateBefore}&q=${query}&type=video&key=${apikey}`
            });

            console.log(videoDetails.data.items.length)
        }
        

        //f no video it returns no video uploaded
        if(videoDetails.data.items.length == 0){
            console.log("No video uploaded")
            return; 
        }

        
        var items = videoDetails.data.items
        
        ///Loops through every video details and fetches necessry details to be saved
        await Promise.all(
            items.map(async (items,index) =>{
                const videoId = items.id.videoId
                
                const videoData = {
                    videoTitle: items.snippet.title,
                    videoPublishedAt: items.snippet.publishedAt,
                    videoURL: `https://www.youtube.com/watch?v=${videoId}`,
                    videoID: videoId,
                    videoDescription: items.snippet.description,
                    videoThumbnail: items.snippet.thumbnails.default.url
        
                }
                video.push(videoData);

            })
        );

            ///if nextPageToken is present, it again hits the api till nextPage token keeps returning
            ///Next pagetoken onl returns if time interval is 35 mins
            /// Since a lot of video are there, API Quota is exhausted at once, giving error
        while(videoDetails.data.nextPageToken){
            var token = videoDetails.data.nextPageToken
            console.log(token)

            if(query == undefined || query == ""){

                videoDetails = await axios({
                    method: "get",
                    url:
                        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=40&order=date&pageToken=${token}publishedAfter=${dateAfter}&publishedBefore=${dateBefore}&type=video&key=${apikey}`
                });
    
                
            }else{
                videoDetails = await axios({
                    method: "get",
                    url:
                        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&order=date&pageToken=${token}publishedAfter=${dateAfter}&publishedBefore=${dateBefore}&q=${query}&type=video&key=${apikey}`
                });
    
            }


            items = videoDetails.data.items;
            await Promise.all(
                items.map(async (items,index) =>{
                    const videoId = items.id.videoId
                    
                    const videoData = {
                        videoTitle: items.snippet.title,
                        videoPublishedAt: items.snippet.publishedAt,
                        videoURL: `https://www.youtube.com/watch?v=${videoId}`,
                        videoID: videoId,
                        videoDescription: items.snippet.description,
                        videoThumbnail: items.snippet.thumbnails.default.url
            
                    }
                    video.push(videoData);
    
                })
            );

        }

        ///Video fetched are added in the database

        const videoAdd = await videoModel.insertMany(video);
        if(videoAdd){
             console.log(video)
             return;
            
        }else{
            console.log("Video Data couldnt be saved");
            return;
        }
        
        
    } catch (error) {
        console.log("Some error occured", error)
        return;
    }
}

exports.playlist = async(req,res) => {

    const playlistId = req.body.playlistId
    const id = playlistId.split("=");
    try {
        const apikey = process.env.API_KEY || "";
        const playlistData = await axios({
            method: "get",
            url:
                `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&id=${id[1]}&maxResults=50&key=${apikey}`
        });

        const playlistItemData = await axios({
            method: "get",
            url:
                `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${id[1]}&key=${apikey}`
        });

        const items = playlistItemData.data.items;
        const genericData = {
            paylistId: id[1],
            noOfVideos: items.length,
            playlistDescription: playlistData.data.items[0].snippet.description,
            thumbnail: playlistData.data.items[0].snippet.thumbnails.default.url  
        }
        const videoIds = []; 
        await Promise.all(
            items.map(async (items,index) =>{
                const ID = items.snippet.resourceId.videoId;
                videoIds.push(ID);
            })
        );
        let video = [];
        await Promise.all(
            videoIds.map(async (videoId, index) =>{
                const data = await axios({
                    method: "get",
                    url:
                        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&part=contentDetails&id=${videoId}&key=${apikey}`
                });

                const videoDetails = data.data;
                const duration = videoDetails.items[0].contentDetails.duration.split("T");


                const videoData = {
                    videoTitle: videoDetails.items[0].snippet.title,
                    videoPublishedAt: videoDetails.items[0].snippet.publishedAt,
                    videoURL: `https://www.youtube.com/watch?v=${videoId}`,
                    videoID: videoId,
                    videoLength: duration[1],
                    videoDescription: videoDetails.items[0].snippet.description,
                    videoThumbnail: videoDetails.items[0].snippet.thumbnails.default.url

                }

                video.push(videoData);
            })
        );
        const final = {
            genericData: genericData,
            videoData: video
        }
        const playlistSave = {
            paylistId: id[1],
            noOfVideos: genericData.noOfVideos,
            playlistDescription: genericData.playlistDescription,
            playlistThumbnail: genericData.thumbnail,
            videoData: video
        }

        if(await playlistModel.exists({paylistId: id[1]})){
            const update = await playlistModel.findOneAndUpdate({paylistId: id[1]}, playlistSave);
            console.log("here");

        }else{
            const playlistAdd = new playlistModel(playlistSave);
            const playlistResult = await playlistAdd.save();
            console.log("in else");
        }
        


        return res
          .status(statusCode.success)
          .json(
            returnJsonResponse(
              statusCode.success,
              "success",
              "Video Data fetched succesfully",
              final
            )
          );

        
    } catch (error) {
        return res
            .status(statusCode.bad)
            .json(
                returnJsonResponse(
                statusCode.bad,
                "fail",
                "Some error occured",
                )
            );
    }
}


exports.getAllVideo = async(req,res) => {
    try {

        //Video are fetched in desc order of pubishing
        const videoData = await videoModel.find().sort({"videoPublishedAt": -1})

        if(videoData){
            return res
          .status(statusCode.success)
          .json(
            returnJsonResponse(
              statusCode.success,
              "success",
              "Video Data fetched succesfully",
              videoData
            )
          );
        }else{
            return res
          .status(statusCode.bad)
          .json(
            returnJsonResponse(
              statusCode.bad,
              "fail",
              "couldnt fetch Video Data",
            )
          );
        }        
    } catch (error) {
        return res
          .status(statusCode.bad)
          .json(
            returnJsonResponse(
              statusCode.bad,
              "fail",
              "Some error occured",
            )
          );
    }

}


exports.getVideo = async(req,res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;

        //Based on title or descrition, videos are returned
        const video = await videoModel.find({$or:[{ videoTitle: title}, { videoDescription: description}]})


        if(video.length != 0){
            return res
          .status(statusCode.success)
          .json(
            returnJsonResponse(
              statusCode.success,
              "success",
              "Video Data fetched succesfully",
              video
            )
          );
        }else{
            return res
          .status(statusCode.bad)
          .json(
            returnJsonResponse(
              statusCode.bad,
              "fail",
              "couldnt fetch Video Data or no video with such title or description",
            )
          );
        }
    } catch (error) {
        return res
          .status(statusCode.bad)
          .json(
            returnJsonResponse(
              statusCode.bad,
              "fail",
              "Some error occured",
            )
          );
    }
}



