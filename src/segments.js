const {join} = require('path');
const fs = require('fs');

const global = remote.getGlobal('shareObject');
const segments = [];
const recorderOptions = {
    mimeType: 'video/webm; codecs=vp9', //codecs=h264', //codecs=vp9',
    videoBitsPerSecond: 200000 // 0.2 Mbit/sec.
};

function recordStream(stream, time, name) {
    const chunks = [];
    const rec = new MediaRecorder(stream, recorderOptions);
    var fileStream;

    if (fs.existsSync(name)) unlinkSync(name);
    
    fileStream = createWriteStream(name, { flags: 'a' });
    
    rec.ondataavailable = e => {
        chunks.push(e.data);
        event.data.arrayBuffer()
            .then(ab => {
                let bff = Buffer.from(ab);
                fileStream.write(bff)
            })
    };
    rec.onstop = e => fileStream.end();
    rec.start(time);

};
function recordSegments(stream, time = 1000, seg = 1, cb) {
    let segg = 0;
    return new Promise((resolve, reject) => {
        let int = setInterval(() => {
            const chunks = [];
            const rec = new MediaRecorder(stream, recorderOptions);

            if (segg >= seg - 1) {
                clearInterval(int);
                //stream.getTracks().forEach(t => t.stop());
                
            };

            rec.ondataavailable = e => chunks.push(e.data);
            rec.onstop = e => {
                //segments.push(new Blob(chunks))
                ++segg;
                cb(chunks[0]);
                
                //exportAsFile(new Blob(chunks), join(global.paths.pub, name))
            };
            rec.start();

            setTimeout(() => rec.stop(), time);
        }, time);
    });
};

function recordFull(stream) {
    const chunks = [];
    const rec = new MediaRecorder(stream);

    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = e => exportOne(new Blob(chunks));
    rec.start();

    setTimeout(() => rec.stop(), 10000);
};

function exportAll(full) {
    vid.remove();
    segments.unshift(full)
    segments.forEach(blob => {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(blob);
        vid.controls = true;
        document.body.appendChild(vid);
    });
};

async function exportAsFile(blob, name) {
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    //Zif (path.existsSync(name)) unlinkSync(name);
    
    writeFile(name, buffer, () => {});
};

module.exports = {
    recordSegments,
    exportAsFile,
    recordStream
}