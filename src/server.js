const http = require("http")
const { Server } = require("socket.io")
const { instrument } = require('@socket.io/admin-ui')
const express = require("express")
const app = express()

const port = 3000

app.set("view engine", "pug")
app.set("views", __dirname+"/views")
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))


const httpServer = http.createServer(app)
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
})

instrument(wsServer, {
    auth: false
})

const {
    sockets: {
        adapter: { sids, rooms }
    }
} = wsServer

const getJoinedRooms = id => [...sids.get(id)]
const getPublicRooms = _ => {
    const roomList = new Object()
    rooms.forEach((_, key) => {
        if (!sids.has(key)) roomList[key] = rooms.get(key).size
    })
    return roomList
}

wsServer.on("connection", socket => {
    console.log(getPublicRooms())
    socket.to(socket.id).emit("room_changed", getPublicRooms())

    // 방 참여
    socket.on("enter_room", (roomName, nickname, done) => {
        socket['nickname'] = nickname
        socket.join(roomName)
        socket.to(roomName).emit("joined_member", nickname)
        done()
        wsServer.sockets.emit("room_changed", getPublicRooms())
    })

    // 닉네임 변경
    socket.on("save_name", (nickname, done) => {
        const before = socket['nickname']
        socket['nickname'] = nickname
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit("send_noti", `[${before}]님의 닉네임이 [${nickname}]으로 변경되었습니다`)
        socket.emit("send_noti", `[${before}]님의 닉네임이 [${nickname}]으로 변경되었습니다`)
        done()
    })

    // 연결 끊김
    socket.on("disconnecting", _ => {
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit("disconnect_member", socket['nickname'])
        wsServer.sockets.emit("room_changed", getPublicRooms())
    })
    socket.on("disconnect", _ => {
        wsServer.sockets.emit("room_changed", getPublicRooms())
    })

    // 새 메세지
    socket.on("new_message", (msg, done) => {
        const joinedRooms = getJoinedRooms(socket.id)
        socket.to(joinedRooms).emit('new_message', `${socket.nickname}: ${msg}`)
        done()
    })
})

httpServer.listen(port, _ => console.log(`Listening on http://localhost:${port}/`))