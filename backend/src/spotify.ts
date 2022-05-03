import axios from 'axios'
import { app } from './express'
import querystring from 'querystring'
import io from './socket'
import { Socket } from 'socket.io'

const basePath = `${process.env.API_PATH}/spotify`
let spotifyUser: SpotifyUser | null = null

// API paths
app.get(`${basePath}/loggedin`, (_req, res) => {
    if (spotifyUser) return res.sendStatus(200)
    else res.sendStatus(404)
})

app.get(`${basePath}/login`, (_req, res) => {
    if (!spotifyUser) {
        const url = 'https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            client_id: process.env.SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            scope: 'user-read-currently-playing'
        })
    
        return res.redirect(url)
    }

    res.send(200)
})

app.get(`${basePath}/login`, (_req, res) => {
    if (!spotifyUser) {
        const url = 'https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            client_id: process.env.SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            scope: 'user-read-currently-playing'
        })
    
        return res.redirect(url)
    }

    res.send(200)
})

app.get(`${basePath}/callback`, async (req, res) => {
    try {
        const data = querystring.stringify({
            grant_type: 'authorization_code',
            code: req.query['code'] as string,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI
        })

        const spotifyRes = await axios.post('https://accounts.spotify.com/api/token', data, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })

        const accessToken = spotifyRes?.data.access_token

        if (!accessToken) throw 'no access token recieved'

        spotifyUser = new SpotifyUser(accessToken)

        res.redirect('http://localhost:3000')
    } catch (error) {
        console.log(error)
    }
})

//Socket setup
io.on('connection', (socket: Socket) => {
    if (spotifyUser?.currentSong) {
        socket.emit('songChange', { song: spotifyUser.currentSong, progress: spotifyUser.progress } )
    }
})

type SpotifySong = {
    id: number,
    name: string,
    artist: string,
    album: string,
    cover: string,
    length: number
}

class SpotifyUser {
    accessToken: string
    currentSong: SpotifySong | null = null
    progress: number = 0

    constructor(accessToken: string) {
        this.accessToken = accessToken
        setInterval(() => this.update(), 1000)
    }

    async update() {
        const data = await this.getData()

        if (data?.progress) this.progress = data.progress
        
        if (this.currentSong?.id !== data?.song.id) {
            if (data?.song) {
                console.log(`Song change: ${data?.song.name}`)
                this.currentSong = data.song
                this.progress = data.progress
                io.emit('songChange', { song: this.currentSong, progress: this.progress })
            }
            else {
                console.log('Song Stopped')
                this.currentSong = null
            }
        }
        else {
            // console.log(`Progress`)
            io.emit('progress', this.progress)
        }
    }

    async getData(): Promise<{ song: SpotifySong, progress: number } | null> {
        try {
            const res = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            })
    
            if (!res.data) return null

            const item: any = res.data.item
    
            return {
                song: {
                    id: item.id,
                    name: item.name,
                    artist: item.artists[0].name,
                    album: item.album.name,
                    cover: item.album.images[0].url,
                    length: item.duration_ms
                },
                progress: res.data.progress_ms / item.duration_ms
            }
        } catch (error) {
            console.error(error)
            return null
        }
    }
}