// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/getScreenId

var port = 1489;
const server = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const socketio = require('socket.io');
const paths = {
    pub: path.join(__dirname)
};
var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.ttf': 'application/x-font-ttf',
    '.otf': 'application/x-font-opentype',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.sfnt': 'application/font-sfnt',
    '.webm': 'video/webm'
};
var serverData;
var app;

function serverHandler(request, response) {
    var filePath = path.join(paths.pub, request.url);
    var extname;
    var contentType;

    if (filePath == path.join(paths.pub, '/')) filePath = path.join(paths.pub, 'index.html');
    if (filePath == path.join(paths.pub, '/app')) filePath = path.join('src', 'index.html');
    if (filePath == path.join(paths.pub, '/videojs-playlist.js')) filePath = path.join(paths.pub, 'videojs-playlist.js');
    if (filePath == path.join(paths.pub, '/render.js')) filePath = path.join('src', 'render.js');
    if (filePath == path.join(paths.pub, '/index.css')) filePath = path.join('src', 'index.css');

    extname = String(path.extname(filePath)).toLowerCase();
    contentType = mimeTypes[extname] || 'application/octet-stream';

    if (!fs.existsSync(filePath)) {
        response.writeHead(200, {
            'Content-Type': contentType,
            'Stream': JSON.stringify(serverData)
        });
        response.end('404', 'utf-8');
    };

    fs.readFile(filePath, (error, content) => {
        response.writeHead(200, {
            'Content-Type': contentType
        });
        response.end(content, 'utf-8');
    });

}

function runServer(data) {
    app = server.createServer(serverHandler);

    serverData = data;
    app.listen(port, process.env.IP || '0.0.0.0', () => {
        var addr = app.address();

        if (addr.address === '0.0.0.0') {
            addr.address = 'localhost';
        }

        console.log('Server listening at http://' + addr.address + ':' + addr.port);
    });
    io = socketio(app);

    io.on('connection', function (socket) {
        socket.on('playlist', function (message) {
            socket.broadcast.emit('server', data);
            socket.broadcast.emit('upd', message);
        });
    });
};
function stopServer() {
    app.close();
    
    console.log('Server stopped');
}

module.exports = {
    runServer,
    stopServer
}