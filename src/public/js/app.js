const socket = new WebSocket(`ws://${window.location.host}`)

const onOpen = _ => console.log("Connected to Server")
const onMsg = msg => console.log(`From server : ${msg.data}`)
const onClose = _ => console.log("Disconnected from server")

socket.addEventListener("open", _ => onOpen)
socket.addEventListener("message", onMsg)
socket.addEventListener("close", onClose)