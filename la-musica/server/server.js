require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");
const lyricsFinder = require("lyrics-finder");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //to access req.query for finding lyrics, parse Url parameter

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  console.log("hi");
  console.log(refreshToken); 
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });

  // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
  spotifyApi
    .refreshAccessToken()
    .then(data => {
      console.log(data.body);
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

app.post("/login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      console.log(data);
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log("authorizationCodeGrant", err);
      res.sendStatus(400);
      console.error("Spotify authorization error, please check login info.");
    });
});

app.get('/lyrics', async (req, res) => {
  const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No lyrics found.";
  res.json({ lyrics })
})

app.listen(8080);
