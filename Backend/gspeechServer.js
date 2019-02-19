var app = require('express')();
var express = require('express');

var port = 3001;

var fs = require('fs');
var path = require('path');
var url = require('url');

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.oddidea.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.oddidea.xyz/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/www.oddidea.xyz/chain.pem')
};

var server = require('https').createServer(options,app);
var io = require('socket.io')(server);

//const sqlite3 = require('sqlite3').verbose();
//let db = new sqlite3.Database('/var/www/html/djangoTest/db.sqlite3');

const environmentVars = require('dotenv').config();
// Google Cloud
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient(); // Creates a client

app.use(express.static(__dirname+'/static'));

app.get('https://www.oddidea.xyz:3001/socket.io/socket.io.js',function(req,res){
    //res.sendFile(__dirname + 'socekt.io.js');
    res.sendFile('https://www.oddidea.xyz/socket/');
});
    

server.listen(3001, function() {
  console.log('Socket IO server listening on port 3001');
});

io.on('connection',function(socket){
	console.log('user port 3001 connected');
    
    let recognizeStream = null;
    
    socket.on('join', function (data) {
        var msg = data.nickName+" Connected to Server";
        console.log(msg);
        socket.emit('connected', msg);
    });
    
    // *********************************************************************
    socket.on('startGoogleCloudStream', function (data) {
        startRecognitionStream(this, data);
    });

    socket.on('endGoogleCloudStream', function (data) {
        stopRecognitionStream();
    });

    socket.on('binaryData', function (data) {
        // console.log(data); //log binary data
        if (recognizeStream !== null) {
            recognizeStream.write(data);
        }
    });

    function startRecognitionStream(socket, data) {
        recognizeStream = speechClient.streamingRecognize(request)
            .on('error', console.error)
            .on('data', (data) => {
                process.stdout.write(
                    (data.results[0] && data.results[0].alternatives[0])
                        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                        : `\n\nReached transcription time limit, press Ctrl+C\n`);
                socket.emit('speechData', data);

                // if end of utterance, let's restart stream
                // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
                if (data.results[0] && data.results[0].isFinal) {
                    stopRecognitionStream();
                    startRecognitionStream(socket);
                    // console.log('restarted stream serverside');
                }
            });
    }

    function stopRecognitionStream() {
        if (recognizeStream) {
            recognizeStream.end();
        }
        recognizeStream = null;
    }    

});

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US'; //en-US

const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        profanityFilter: false,
        enableWordTimeOffsets: true
    },
    interimResults: true // If you want interim results, set this to true
};

