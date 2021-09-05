const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("./login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000/",
    clientId: "027b3db8ab8441368696f8b9df5eb6ea",
    clientSecret: "1a50ed19217f46a09302b7de11c9b290",
  });
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_Token,
        refreshToken: data.body.refresh_Token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      res.sendStatus(err);
      console.error("Spotify authorization error, please check login info.");
    });
});

app.listen(8080);
