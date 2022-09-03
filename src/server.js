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
    
})

httpServer.listen(port, _ => console.log(`Listening on http://localhost:${port}/`))