import axios from "axios"

export async function guessUserTaste(favArtists: string[], token: string) {
    try {
        const artistDetails = await Promise.all(
            favArtists.map(artist => 
                axios.get(`https://api.spotify.com/v1/search`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        q: artist,
                        type: 'artist',
                        limit: 1
                    },
                })
            )
        );

        const genresCount: { [key: string]: number } = {};
        const popularityScores: number[] = [];
        let previewLink: string | null = null;

        //loops all the aritist and give out their genre
        for (let i = 0; i < artistDetails.length; i++) {
            const artist = artistDetails[i].data.artists.items[0];
            const genres = artist.genres;
            const popularity = artist.popularity;

            
            genres.forEach((genre: string) => {
                genresCount[genre] = (genresCount[genre] || 0) + 1;
            });

            
            popularityScores.push(popularity);

            // fetch their popular songs
            if (!previewLink) {
                const topTracksResponse = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        market: 'India', 
                    }
                });

                //find first working preview url
                const validTrack = topTracksResponse.data.tracks.find((track: {preview_url:string}) => track.preview_url);
                if (validTrack) {
                    previewLink = validTrack.preview_url; 
                }
            }
        }

        
        const sortedGenres = Object.entries(genresCount).sort((a, b) => b[1] - a[1]);
        const topGenres = sortedGenres.slice(0, 3).map(([genre]) => genre);//gives out top three genre

        
        const averagePopularity = popularityScores.reduce((a, b) => a + b, 0) / popularityScores.length;

        return {
            topGenres,
            averagePopularity,
            recommendation: `It looks like you enjoy ${topGenres.join(', ')} music!`,
            previewLink: previewLink ? previewLink : 'No preview link found' 
        };
    } catch (error) {
        console.error('Error fetching artist or track details:', error);
        return {
            topGenres: [],
            averagePopularity: 0,
            recommendation: 'There was an issue guessing your taste.',
            previewLink: null
        };
    }
}
