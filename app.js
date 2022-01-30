require("dotenv").config()
const express = require('express')
const app = express()
const routes = require('./routes')
const cors = require('cors')
const http = require('http')
const server = http.createServer(app)

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cors())

app.use('/', routes)

server.listen(process.env.PORT, () => console.log(`app is running in ${process.env.PORT}`))