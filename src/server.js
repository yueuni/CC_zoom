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
    socket.on("enter_room", (roomName, nickname, done) => {
        socket['nickname'] = nickname
        socket.join(roomName)
        done()
        socket.to(roomName).emit("joined_member", nickname)
    })

    socket.on("save_name", (nickname, done) => {
        const before = socket['nickname']
        socket['nickname'] = nickname
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit("send_noti", `[${before}]님의 닉네임이 [${nickname}]으로 변경되었습니다`)
        socket.emit("send_noti", `[${before}]님의 닉네임이 [${nickname}]으로 변경되었습니다`)
        done()
    })

    // 연결 끊김
    socket.on("disconneting", _ => {
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit("disconnet_mamber", socket['nickname'])
    })

    // 새 메세지
    socket.on("new_message", (msg, done) => {
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit('new_message', `${socket.nickname}: ${msg}`)
        done()
    })
})

httpServer.listen(port, _ => console.log(`Listening on http://localhost:${port}/`))