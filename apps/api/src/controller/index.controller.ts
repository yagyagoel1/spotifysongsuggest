import { getSpotifyToken} from "../helper/getToken";
import { searchSongsByMood } from "../helper/searchSongByMood";
import { guessUserTaste } from "../helper/tasteFinder";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request,Response } from "express";




const getSongs = asyncHandler(async (req:Request,res:Response)=>{

    let mood = String(req.query.mood);

    if (!mood) {
        return res.status(400).json(new ApiResponse(400,"please specify your mood"))
    }
    mood = mood.trim();
    try {
        const token = await getSpotifyToken();
        const data = await searchSongsByMood(mood, token);

        const formattedSongs = data.songs.map((song:any) => ({
            name: song.name,
            artist: song.artist,
            album: song.album.name,
            image_url:song.image_url,
            external_url: song.external_url,
        }));

        res.json(
            {formattedSongs,previewUrls:data.previewUrls});
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiResponse(500, 'Error fetching songs from Spotify API' ));
    }
})

const assumedGenre = asyncHandler(async(req:Request,res:Response)=>{
    const artists:string[] = req.body.artists;
    if (!artists||artists.length<=1) {
        return res.status(400).json(new ApiResponse(400,"please specify at least 2 artist"))
    }
    const token = await getSpotifyToken();
    const feedback =await  guessUserTaste(artists,token)
    if(!feedback.topGenres||feedback.topGenres.length<=0){
        return res.status(500).json(new ApiResponse(500,"there was the problem generating your taste",feedback))
    }
    return res.status(200).json(new ApiResponse(200,"fetched your taste successfully",feedback))
})
export {getSongs,assumedGenre}