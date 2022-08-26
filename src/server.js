const http = require('http')
const WebSocket = require('ws')
const express = require("express")
const app = express()

const port = 3000

app.set("view engine", "pug")
app.set("views", __dirname+"/views")
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))

const handleListen = () => console.log(`Listening on http://localhost:${port}/`)

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on("connection", (socket) => console.log(socket))

app.listen(port, handleListen)