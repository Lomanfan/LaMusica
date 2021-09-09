import { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import useAuth from "./useAuth.js";
import TrackSearchResult from "./TrackSearchResult.js"
import Player from "./Player.js";
import axios from "axios";
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: "027b3db8ab8441368696f8b9df5eb6ea",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  // console.log(searchResults);

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");   //when song changes, set lyrics to ""
  }

  useEffect(() => {
    if (!playingTrack) return;

    axios.get('http://localhost:8080/lyrics', {
      params: {
        track: playingTrack.title,
        artist: playingTrack.artist,
      }
    }).then(res => {
      setLyrics(res.data.lyrics);
    })
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;

    spotifyApi.searchTracks(search).then((res) => {
      // console.log(res);
      if (cancel) return;

      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            }, track.album.images[0])

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          }
        })
      )
    })

    return () => cancel = true;  //make a request, if another new request is made in the same time period, set cancel to true.
  }, [search, accessToken]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map(track => (
          <TrackSearchResult 
            track={track} 
            key={track.uri} 
            chooseTrack={chooseTrack}
          />
        ))}
        { searchResults.length === 0 && (
          <div className="text-center" style={{ whiteSpace: "pre"}}>
            {lyrics}
          </div>
        )}
      </div>
      <div><Player accessToken={accessToken} trackUri={playingTrack?.uri}/></div>
    </Container>
  );
}
