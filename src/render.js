const { desktopCapturer, remote, ipcRenderer, shell } = require('electron');
const { writeFile, writeFileSync, existsSync, unlinkSync, createWriteStream } = require('fs');
const path = require('path');
const MultiStreamsMixer = require('multistreamsmixer');
const io = require('socket.io-client/dist/socket.io');

const { dialog, Menu } = remote;
const global = remote.getGlobal('shareObject');
const localhost = 'http://localhost:1489';

// Buttons
const title = document.querySelector('title');
const body = document.querySelector('body');
const header = document.querySelector('h1 a');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');


const sourceList = document.querySelector('.list');
const menu = document.querySelector('.menu');
const videoBlock = document.querySelector('.video');

//menu
const newStream = menu.querySelector('.stream');
const newMultistream = menu.querySelector('.multistream');

//video
const videoElement = document.querySelector('video');
const runTitle = document.querySelector('.run-title');
const runLink = document.querySelector('.run-link');
const runStream = document.querySelector('.run-stream');
const stopStream = document.querySelector('.stop-stream');
const runMic = document.querySelector('.run-mic');
const runSound = document.querySelector('.run-sound');

var view = {
    stream: {
        title: false,
        ngrok: false
    },
    menu: {
        activeSource: false,
        elem: false,
        mic: false,
        audio: false
    },
    views: {
        start() {
            getSourcesPreview();
            this.show();
            runStream.disabled = true;
        },
        show() {
            sourceList.classList.remove('hidden');
            videoBlock.classList.remove('hidden');
        },
        async videoPreview() {
            runStream.disabled = false;
            runTitle.innerText = view.menu.activeSource.name;
        },
        startingStream() {
            runStream.disabled = true;
            runStream.innerText = 'starting...';
        },
        runStream() {
            let data = view.stream.ngrok;

            runLink.href = data.url;
            runLink.innerText = data.url;
            runLink.title = data.url;
            title.innerText = data.url;
            
            runStream.disabled = false;
            runStream.innerText = 'Start';

            body.classList.add('rec');
            runStream.classList.add('hidden')
            stopStream.classList.remove('hidden')
            
            runLink.classList.remove('hidden')
            runMic.classList.remove('hidden')
            runSound.classList.remove('hidden')
        },
        stopStream() {
            let data = view.stream.ngrok;

            runLink.href = '';
            runLink.innerText = 'stream url';
            runLink.title = '';
            title.innerText = '';

            body.classList.remove('rec');
            runStream.classList.remove('hidden');
            stopStream.classList.add('hidden');

            runLink.classList.add('hidden')
            runMic.classList.add('hidden')
            runSound.classList.add('hidden')
            
        },
        switchMic() {
            if (micTrack.enabled) return runMic.innerText = 'Microphone Enable';
            runMic.innerText = 'Microphone Disable';
        },
        switchAudio() {
            if (audioTrack.enabled) return runSound.innerText = 'Sound Enable';
            runSound.innerText = 'Sound Disable';   
        }
    }
};


// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
let recordedChunks = [];

let mediaStream;
let videoTrack;
let micTrack;
let audioTrack;

let socket;
let interval;
let file = 0;
let timings = 3000;
let ages = [0, 0, 0];


body.addEventListener('click', event => {
    if (!event.target.href) return;
    event.preventDefault();
    let link = event.target.href;
    shell.openExternal(link);
});

newStream.addEventListener('click', async (e) => {
    await getSourcesPreview()
});

runStream.addEventListener('click', async (e) => {
    startStreaming()
});

stopStream.addEventListener('click', async (e) => {
    stopStreaming()
});

runMic.addEventListener('click', async (e) => {
    runStopMic()
});
runSound.addEventListener('click', async (e) => {
    runStopAudio()
});


//init
stopStreaming();
view.views.start();


function changeView(v) {
    let vv = view.views[v];
    if (vv) vv();
};

function runStopMic() {
    changeView('switchMic');
    micTrack.enabled = micTrack.enabled ? false : true;
    console.log(micTrack)
};
function runStopAudio() {
    changeView('switchAudio');
    audioTrack.enabled = audioTrack.enabled ? false : true;
    console.log(audioTrack)
};

function stopStreaming() {
    clearInterval(interval);
    
    ipcRenderer.send('kill');
    changeView('stopStream');
};

async function startStreaming() {
    let data = {
        title: runTitle.value
    };
    selectSource(view.menu.activeSource);
    seq(); //chunks recording
    socket = io(localhost, {
        'reconnect': false
    });
    changeView('startingStream')
    ipcRenderer.send('ngrok', data);
    ipcRenderer.on('async-ngrok', (event, data) => {
        view.stream.ngrok = data;
        runStream.disabled = true;
        changeView('runStream')
    })
}
async function playPreview() {
    // Preview the source in a video element
    let constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: view.menu.activeSource.id
            }
        }
    };
    let stream = await navigator.mediaDevices.getUserMedia(constraints);
        
    videoElement.srcObject = stream;
    videoElement.play();
};
async function getSourcesPreview() {
    const isc = await navigator.mediaDevices.enumerateDevices(); //audio-input
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    isc.find(d => {
        if (d.kind == 'audioinput' && d.deviceId == 'default') {
            view.menu.mic = d;
            return true
        };
        return false
    });
    isc.find(d => {
        if (d.kind == 'audiooutput' && d.deviceId == 'default') {
            view.menu.audio = d;
            return true
        };
        return false
    });

    inputSources.map(async (src) => {
        let elem = document.createElement('div');
        //let stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        elem.classList.add('item')
        elem.innerHTML = /*html */`
            <!--div class="thumb">
                <video muted="muted" autoplay="autoplay"></video>
            </div-->            
            <div class="info">
                ${src.name}
            </div>            

        `;
        elem.addEventListener('click', e => {
            view.menu.elem = elem;
            view.menu.activeSource = src;
            playPreview();
            changeView('videoPreview');
        });

        //elem.querySelector('video').srcObject = stream;
        sourceList.appendChild(elem);
    });

};

async function selectSource(source) {
    const videoConstraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };
    const micConstrains = {
        audio: {
            deviceId: view.menu.mic.deviceId ? {exact: view.menu.mic.deviceId} : undefined
        }
    };
    const audioConstrains = {
        audio: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        },
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
    const mic = await navigator.mediaDevices.getUserMedia(micConstrains);
    const aud = await navigator.mediaDevices.getUserMedia(audioConstrains);
    const mix = new MultiStreamsMixer([mic, aud]).getMixedStream();
    
    
    videoTrack = stream.getVideoTracks()[0];
    micTrack = mic.getAudioTracks()[0];
    audioTrack = aud.getAudioTracks()[0];
    mixedTrack = mix.getAudioTracks()[0];
    
    mediaStream = new MediaStream([
        videoTrack,
        mixedTrack
        //micTrack,
        //audioTrack
    ]);
    
    audioTrack.enabled = true;
    micTrack.enabled = false;
    
    //if (videoTrack) mediaStream.addTrack(videoTrack);
    //if (micTrack) mediaStream.addTrack(micTrack);
    //if (audioTrack) mediaStream.addTrack(audioTrack);

};
function newvolumeControl(stream) {
    let audioContext = new AudioContext()
    let gainNode = audioContext.createGain();
    let audioSource = audioContext.createMediaStreamSource(stream);
    let audioDestination = audioContext.createMediaStreamDestination();
    audioSource.connect(gainNode);
    gainNode.connect(audioDestination);
    gainNode.gain.value = 1;
    //window.localStream = audioDestination.stream;
    //audioElement.srcObject = window.localStream; //for playback
    //you can add this stream to pc object
    // pc.addStream(window.localStream);
}

function seq() {
    interval = setInterval(() => {
        let md = rec(mediaStream, file);
        md.start();
        setTimeout(() => {
            md.stop();
        }, timings);
        if (file == 2) return file = 0;
        ++file;

    }, timings);
};
function rec(stream, i) {
    const options = {
        mimeType: 'video/webm; codecs="opus,vp8"',
        videoBitsPerSecond: 200000,
        width: {exact: 3920}
    };
    let chunks = [];
    let mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, {
            type: options
        });
        const buffer = Buffer.from(await blob.arrayBuffer());
        socket.emit('playlist', {
            playlist: i,
            ages
        });
        ++ages[i];
        handleSave(buffer, i);
        
    };
    return mediaRecorder
};

function handleSave(ee, i = 0) {
    let pth = path.join(__dirname, 'public', `vid-${i}.webm`); //`./public/vid-${i}.webm`

    writeFileSync(pth, ee, () => console.log('video saved successfully!'));
}