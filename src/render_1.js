const { desktopCapturer, remote, ipcRenderer, shell } = require('electron');
const { writeFile, writeFileSync, existsSync, unlinkSync, createWriteStream } = require('fs');
const io = require('socket.io-client/dist/socket.io');
const { dialog, Menu } = remote;
const global = remote.getGlobal('shareObject');
const localhost = 'http://localhost:1489';

// Buttons
const title = document.querySelector('title');
const body = document.querySelector('body');
const header = document.querySelector('h1 a');
const videoElement = document.querySelector('video');
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

var view = {
    stream: {
        title: false
    },
    menu: {
        activeSource: false,
        elem: false
    },
    views: {
        show() {
            sourceList.classList.remove('hidden')
            videoBlock.classList.remove('hidden')
        }
    }
}

body.addEventListener('click', event => {
    if (!event.target.href) return;
    event.preventDefault();
    let link = event.target.href;
    shell.openExternal(link);
});

newStream.addEventListener('click', async (e) => {
    await getSourcesPreview()
});

getSourcesPreview()
//videoSelectBtn.addEventListener('click', e => getVideoSources());
//startBtn.addEventListener('click', e => startHandler());
//stopBtn.addEventListener('click', e => stopHandler());
// startBtn.disabled = true;
// stopBtn.disabled = true;

function changeView(v) {
    let vv = view.views[v];
    if (vv) vv();
}

// Get the available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );


    videoOptionsMenu.popup();
};

async function getSourcesPreview() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    inputSources.map(async (src) => {
        let elem = document.createElement('div');
        let constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: src.id
                }
            }
        };
        //let stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        elem.classList.add('item')
        elem.innerHTML = /*html */`
            <div class="thumb">
                <!--video muted="muted" autoplay="autoplay"></video-->
            </div>            
            <div class="info">
                ${src.name}
            </div>            

        `;
        elem.addEventListener('click', e => {
            view.menu.elem = elem;
            view.menu.activeSource = src;
        })
        //elem.querySelector('video').srcObject = stream;
        sourceList.appendChild(elem);
        changeView('show');
    });

};

// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
let recordedChunks = [];
let broadcastUI;
let mediaStream;
let socket = io(localhost);
let interval;
let file = 0;
let timings = 3000;
let ages = [0, 0, 0];

function getNgrok(source) {
    ipcRenderer.send('ngrok');
    return new Promise((resolve) => {
        ipcRenderer.on('async-ngrok', (event, data) => {
            resolve(data)
        })
    });
}
// setInterval(() => {
//     getNgrok().then(d => {
//         d.tunnels.tunnels.sort((a, b) => a.proto == 'https' ? 1 : -1)
//         infoPre.innerHTML = JSON.stringify(d.tunnels.tunnels, undefined, 2)
//     })
// }, 5000)
// Change the videoSource window to record
async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                minHeight: 1080,
                minWidth: 1920,
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    mediaStream = new MediaStream();
    
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    if (videoTrack) mediaStream.addTrack(videoTrack);
    if (audioTrack) mediaStream.addTrack(audioTrack);

    // Preview the source in a video element
    videoElement.srcObject = stream;
    videoElement.play();

    startBtn.disabled = false;
};


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
        videoBitsPerSecond: 200000
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


function rec_stream(stream, i) {
    const options = {
        mimeType: 'video/webm; codecs="opus,vp8"',
        videoBitsPerSecond: 100000
    };
    let chunks = [];
    let mediaRecorder = new MediaRecorder(stream, options);
    let fileStream;
    let name = `./public/vid-${i}.webm`;
    if (existsSync(name)) unlinkSync(name);
    
    fileStream = createWriteStream(name, { flags: 'a' });
    
    mediaRecorder.ondataavailable = e => {
        chunks.push(e.data);
        e.data.arrayBuffer()
            .then(ab => {
                let bff = Buffer.from(ab);
                fileStream.write(bff)
            })
    };
    mediaRecorder.onstart = e => socket.emit('playlist', {
        playlist: i
    });
    mediaRecorder.onstop = e => fileStream.end();
    mediaRecorder.start(1000);
    return mediaRecorder
};



function startHandler() {
    seq();

    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    body.classList.add('rec');
    startBtn.innerText = 'Recording';
};
function stopHandler() {
    clearInterval(interval);
    startBtn.disabled = false;
    stopBtn.disabled = false;
    body.classList.remove('rec');
    startBtn.innerText = 'Start';
};

// Captures all recorded chunks
function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    if (filePath) {
        writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }

}
function handleSave(ee, i = 0) {

    writeFileSync(`./public/vid-${i}.webm`, ee, () => console.log('video saved successfully!'));
}
