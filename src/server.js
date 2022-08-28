const http = require("http")
const SocketIO = require("socket.io")
const express = require("express")
const { parse, join } = require('path')
const app = express()

const port = 3000

app.set("view engine", "pug")
app.set("views", __dirname+"/views")
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))


const httpServer = http.createServer(app)
const wsServer = SocketIO(httpServer)

const getJoinedRooms = id => [...wsServer.sockets.adapter.sids.get(id)]

wsServer.on("connection", socket => {
    // 방 참여
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName)
        done()
        socket.to(roomName).emit("joined_member")
    })

    // 연결 끊김
    socket.on("disconneting", _ => {
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit("disconnet_mamber")
    })

    // 새 메세지
    socket.on("new_message", (msg, done) => {
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit('new_message', msg)
        done()
    })
})

httpServer.listen(port, _ => console.log(`Listening on http://localhost:${port}/`))