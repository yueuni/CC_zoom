const http = require('http')
const WebSocket = require('ws')
const express = require("express")
const { parse } = require('path')
const app = express()

const port = 3000

app.set("view engine", "pug")
app.set("views", __dirname+"/views")
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))


const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const onClose = _ => console.log("Disconnected from the Browser")
const onMsg = msg => console.log(msg.toString())

const sockets = []

wss.on("connection", socket => {
    socket["nickname"] = "Anon"
    sockets.push(socket)
    console.log("Connected to Browser")

    socket.on("close", onClose)
    socket.on("message", msg => {
        const message = JSON.parse(msg)

        switch(message.type) {
            case "new_message": 
                sockets.forEach(s => {
                    if(s != socket) s.send(`${socket.nickname} : ${message.payload}`)
                })
                break
            case "nickname": 
                socket["nickname"] = message.payload
        }
    })
})

server.listen(port, _ => console.log(`Listening on http://localhost:${port}/`))