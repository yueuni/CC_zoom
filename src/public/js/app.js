const socket = io()

const roomList = document.getElementById("roomList")
const room = document.getElementById("room")
const chat = room.querySelector('ul')

let roomName;

room.hidden = true

const scrollDown = _ => chat.scrollTop = chat.scrollHeight;

const enterRoom = _ => {
    room.hidden = false
    roomList.hidden = true
}

const newMsg = (type, msg) => {
    const li = document.createElement('li')
    li.innerText = msg
    li.style.listStyle = "none"

    //스타일 설정
    switch (type) {
        case "noti":
            li.style.color = "#bab7b7"
            li.style.textAlign = "center"
            break
        case "to":
            li.style.textAlign = "end"
            break
    }

    chat.appendChild(li)
    scrollDown()
}

const initInput = input => {
    const value = input.value
    input.value = ""
    return value
}

// 방 참여
const roomListForm = document.getElementById("join_form")
roomListForm.addEventListener("submit", event => {
    event.preventDefault()
    const nickname = roomListForm.querySelector('#input_name')
    const inputRoomName = roomListForm.querySelector('#input_room')
    roomName = initInput(inputRoomName)
    socket.emit("enter_room", roomName, nickname.value, enterRoom)
})

// 닉네임 변경
const roomNameForm = room.querySelector('#btn_chg_name')
roomNameForm.addEventListener("click", event => {
    event.preventDefault()
    const name = prompt('변경할 닉네임을 입력해주세요')
    socket.emit("save_name", name, _ => alert('닉네임이 변경되었습니다'))
})

// 메세지 전송
const roomMsgForm = room.querySelector('#msg_form')
roomMsgForm.addEventListener("submit", event => {
    event.preventDefault()
    const input = roomMsgForm.querySelector('input')
    const msg = initInput(input)
    socket.emit("new_message", msg, _ => newMsg('to', `You: ${msg}`))
})

// 메세지 수신
socket.on('new_message', msg => newMsg('from', msg))

// 공지
socket.on('send_noti', msg => newMsg('noti', msg))

// 새로운 멤버 참여
socket.on('joined_member', nickname => newMsg('noti', `[${nickname}]님이 참여했습니다.`))

// 다른 멤버 퇴장
socket.on('disconnect_member', nickname => newMsg('noti', `[${nickname}]님이 퇴장했습니다.`))

// 방 상태 변동
socket.on('room_changed', rooms => {
    const roomListUl = roomList.querySelector('ul')
    roomListUl.innerHTML = ""

    Object.keys(rooms).forEach(room => {
        const roomLi = document.createElement('li')
        roomLi.innerText = `${room} (${rooms[room]})`
        roomListUl.appendChild(roomLi)
    })

    room.querySelector('h1').innerText = `${roomName} (${rooms[roomName]})`
})