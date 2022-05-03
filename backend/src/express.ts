import express from 'express'
export const app = express()

app.listen(process.env.EXPRESS_PORT, () => console.log(`Listening on port ${process.env.EXPRESS_PORT}`))