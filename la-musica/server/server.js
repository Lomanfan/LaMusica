const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refresh_token;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000/",
    clientId: "027b3db8ab8441368696f8b9df5eb6ea",
    clientSecret: "1a50ed19217f46a09302b7de11c9b290",
    refreshToken,
  });
  
  // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
  spotifyApi
  .refreshAccessToken()
  .then(data => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      })
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    })
})

app.post("/login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000/",
    clientId: "027b3db8ab8441368696f8b9df5eb6ea",
    clientSecret: "1a50ed19217f46a09302b7de11c9b290",
  });
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      console.log(data);
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch((err) => {
      console.log("authorizationCodeGrant", err);
      res.sendStatus(400);
      console.error("Spotify authorization error, please check login info.");
    });
});

app.listen(8080);
