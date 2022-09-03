const socket = io();

const myCam = document.getElementById('myCam');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraList = document.getElementById('cameraList');

let mySteam;

const camOpt = { mute: false, camera: false };

const getCameras = async _ => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(d => d.kind === "videoinput")

        const currentCam = mySteam.getVideoTracks()[0]

        cameras.forEach(c => {
            const option = document.createElement('option')
            option.value = c.deviceId
            option.innerText = c.label

            if(currentCam.label == c.label) option.selected = true

            cameraList.appendChild(option)

        })
    } catch (e) {
        console.log(e)
    }
}

const getMedia = async id => {
    let option = { audio: true, video: { diviceId: { exact : id } }}

    try {
        if (id == undefined) {
            await getCameras()
            option = { audio: true, video: { facingMode: "user" }}
        }

        mySteam = await navigator.mediaDevices.getUserMedia(option);
        myCam.srcObject = mySteam;
    } catch (e) {
        console.log(e)
    }
}

getMedia()

const clickCameraOpt = type => {
    // 버튼 텍스트 변경 및 캠 옵션 변경
    switch (type) {
        case 'camera':
            mySteam.getVideoTracks().forEach(track => (track.enabled = !track.enabled))
            cameraBtn.innerText = camOpt[type] ? 'Turn Camera Off' : 'Turn Camera On'
            break;
        case 'mute':
            mySteam.getAudioTracks().forEach(track => (track.enabled = !track.enabled))
            muteBtn.innerText = camOpt[type] ? 'Mute' : 'Unmute'
            break;
    }

    // 옵션 상태 스위칭
    camOpt[type] = !camOpt[type]
}

muteBtn.addEventListener('click', e => clickCameraOpt('mute'))
cameraBtn.addEventListener('click', e => clickCameraOpt('camera'))
cameraList.addEventListener('input', e => getMedia(cameraList.value))

