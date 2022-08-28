const socket = io()

const roomList = document.getElementById("roomList")
const room = document.getElementById("room")

let roomName;

room.hidden = true

const enterRoom = _ => {
    room.hidden = false
    roomList.hidden = true
    room.querySelector('h3').innerText =  roomName
}

const newMsg = (type, msg) => {
    const li = document.createElement('li')
    li.innerText = msg
    room.querySelector('ul').appendChild(li)
}

// 방 참여
const roomListForm = document.getElementById("join_form")
roomListForm.addEventListener("submit", event => {
    event.preventDefault()
    const input = roomListForm.querySelector('input')
    socket.emit("enter_room", input.value, enterRoom)
    roomName = input.value
    input.value = ""
})

// 닉네임 변경
const roomNameForm = room.querySelector('#name_form')
roomNameForm.addEventListener("submit", event => {
    event.preventDefault()
    const input = roomNameForm.querySelector('input')
    const name = input.value
    socket.emit("save_name", name, _ => {})
    input.value = ""
})

// 메세지 전송
const roomMsgForm = room.querySelector('#msg_form')
roomMsgForm.addEventListener("submit", event => {
    event.preventDefault()
    const input = roomMsgForm.querySelector('input')
    const msg = input.value
    socket.emit("new_message", msg, _ => newMsg('to', `You: ${msg}`))
    input.value = ""
})

// 메세지 수신
socket.on('new_message', msg => newMsg('from', msg))

// 방 참여
socket.on('joined_member', _ => newMsg('from', 'Joind'))