const msgList = document.querySelector("ul")
const nickForm = document.querySelector("#nick")
const msgForm = document.querySelector("#msg")

const socket = new WebSocket(`ws://${window.location.host}`)

const onOpen = _ => console.log("Connected to Server")
const onMsg = msg => {
    const li = document.createElement('li')
    li.innerText = msg.data || msg
    msgList.append(li)
}
const onClose = _ => console.log("Disconnected from server")

socket.addEventListener("open", _ => onOpen)
socket.addEventListener("message", onMsg)
socket.addEventListener("close", onClose)

const sendToServer = (socket, type, payload) => socket.send(JSON.stringify({type, payload}))

// 메세지 전송
msgForm.addEventListener("submit", event => {
    event.preventDefault()
    const input = msgForm.querySelector('input')
    sendToServer(socket, "new_message", input.value)
    onMsg(`You : ${input.value}`)
    input.value = ""
})

// 닉네임 저장
nickForm.addEventListener("submit", event => {
    event.preventDefault()
    const input = nickForm.querySelector('input')
    sendToServer(socket, "nickname", input.value)
    input.value = ""
})