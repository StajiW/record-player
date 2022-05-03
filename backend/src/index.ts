import dotenv from 'dotenv'
dotenv.config()

import './express'
import './spotify'



// app.get('/api/loggedin', (_req, res) => {
//     if (spotifyUser) return res.sendStatus(200)
//     else res.sendStatus(404)
// })

// app.get('/api/login', (_req, res) => {
//     if (!spotifyUser) {
//         const url = 'https://accounts.spotify.com/authorize?' + 
//         querystring.stringify({
//             client_id: process.env.SPOTIFY_CLIENT_ID,
//             response_type: 'code',
//             redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
//             scope: 'user-read-currently-playing'
//         })
    
//         return res.redirect(url)
//     }

//     res.send(200)
// })







// const app = express()
// const querystring = require('querystring')
// const axios = require('axios')
// require('dotenv').config()

// const SpotifyUser = require('./spotify.js')
// let spotifyUser: any = null

// app.get('/api/loggedin', (_req, res) => {
//     if (spotifyUser) return res.sendStatus(200)
//     else res.sendStatus(404)
// })

// app.get('/api/login', (_req, res) => {
//     if (!spotifyUser) {
//         const url = 'https://accounts.spotify.com/authorize?' + 
//         querystring.stringify({
//             client_id: process.env.SPOTIFY_CLIENT_ID,
//             response_type: 'code',
//             redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
//             scope: 'user-read-currently-playing'
//         })
    
//         return res.redirect(url)
//     }

//     res.send(200)
// })

// app.get('/api/callback', async (req, res) => {
//     if (req.error) {
//         throw(req.error)
//     }
//     else {
//         try {
//             const data = querystring.stringify({
//                 grant_type: 'authorization_code',
//                 code: req.query.code,
//                 redirect_uri: process.env.SPOTIFY_REDIRECT_URI
//             })

//             const spotifyRes = await axios.post('https://accounts.spotify.com/api/token', data, {
//                 headers: {
//                     Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 },
//             })
    
//             const accessToken = spotifyRes.data.access_token

//             if (!accessToken) throw 'no access token recieved'

//             spotifyUser = new SpotifyUser(accessToken)

//             res.redirect('http://localhost:3000')
//         } catch (error) {
//             console.log(error)
//         }
//     }
// })


// app.listen(process.env.EXPRESS_PORT, () => console.log(`Listening on port ${process.env.EXPRESS_PORT}`))