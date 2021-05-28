# famPay_Task

do "npm i" to install all the dependencies

add your YOUTUBE API V3 KEY in the "apikey" variable in "playlist" and "video" function in controller.

start up your local mongodb, as this project uses mongodb as its database

The video function runs every 2 minutes and fetch new video and save it in database
the defaut "query" is "tea", which can be changed from "query" variable

the video function can also be run by hitting the api "http://localhost:3000/api/video" as POST method, also you can specify the "query" in the body under "query" variable during this

to GET all video in descending order, hit the api "http://localhost:3000/api/getallvideo"

to GET the video based on title and/or description, hit the api "http://localhost:3000/api/getvideo" and specify the "title" and "description" in the request body


BONUS

I have also added a function, which returns all the video and its data from a playlist, hit the api "http://localhost:3000/api/playlist" with "playlistId" in req body, example of playlistId = "https://www.youtube.com/playlist?list=PLWPirh4EWFpE8ceI4fy9TUrItpSg4j3cn"