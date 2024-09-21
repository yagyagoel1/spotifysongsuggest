import axios from "axios";
export async function searchSongsByMood(mood: string, token: string):Promise<{songs:[{name:string,artist:string,album:string,imageUrl:string,external_url:string}]|[],previewUrls:string[]|[]}> {
    try {
        const searchResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                seed_genres: mood, //this is used as genre
                limit: 20, // this you know if not why are you here
                target_valence: mood === 'happy' ? 0.8 : mood==="sad"?0.0:0.4, // 1=happy 0=sad
            },
        });

        const tracks = searchResponse.data.tracks;

     //getting all tracks
        const songs = tracks.map((track: {name:string,artists:[artist:{name:string}],album:{name:string,images:[{url:string}]},external_urls:{spotify:string}}) => ({
            name: track.name,
            artist: track.artists.map((artist: {name:string}) => artist.name).join(', '),
            album: track.album.name,
            image_url: track.album.images[0]?.url, //using only the first image
            external_url: track.external_urls.spotify,
        }));

        
        const previewUrls = tracks
            .map((track: {name:string,artists:[artist:{name:string}],album:{name:string,images:[{url:string}]},external_urls:{spotify:string},preview_url:string}) => track.preview_url)
            .filter((url: string | null) => url !== null); // remove all teh null url

        return { songs, previewUrls };
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return { songs: [], previewUrls: [] };
    }
}
