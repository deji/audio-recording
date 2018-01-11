'use strict';

// ref https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/audio/js/main.js
// ref https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API

var audio, chunks = [];
var mediaRecorder, results;

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
    audio: true,
};

function handleSuccess(stream) {

    document.querySelector('#record').onclick = function (e) {
        console.log('starting');
        mediaRecorder.start();
        results.innerHTML += "recording started<br/>";
    }

    document.querySelector('#stop').onclick = function (e) {
        console.log('stopping');
        mediaRecorder.stop();
        results.innerHTML += "recording stopped<br/>";
    }

    var audioTracks = stream.getAudioTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using audio device: ' + audioTracks[0].label);
    stream.oninactive = function () {
        console.log('Stream ended');
    };
    window.stream = stream; // make variable available to browser console
    // document.querySelector('#gum-local').srcObject = stream;
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = function (e) {
        console.log('Data chunk: ' + e.data)
        console.log(e.data)
        chunks.push(e.data);
    }

    mediaRecorder.onstop = function (e) {
        console.log("recorder stopped");
        var blob = new Blob(chunks, { 'type': 'audio/wav' });
        chunks = [];
        var audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
        audio.controls = true;
        results.innerHTML += "recording available<br/>";
        saveAudio(blob, results);
    }

}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
    alert('Audio recording not available. Did you give me audio permission?')
}

function start() {

    console.log('testing variables');
    audio = document.querySelector('#gum-local')
    console.log(audio);
    results = document.querySelector('#results');
    results.innerHTML = "";

    navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);

}

function saveAudio(blob, feedback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            console.log('successful post');
            feedback.innerHTML += 'posting to server successful';
        } else if (req.readyState === 4) {
            console.log('failed post');
            feedback.innerHTML += 'posting to server failed';
        }
    }
    
    var url = "/save_audio";
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        var base64data = reader.result;
        if (base64data != null) {
            req.open("POST", url, true);
            req.setRequestHeader("Content-Type", "multipart/form-data");
            req.send(base64data);
        } else {
            console.log('saving post failed');
            feedback.innerHTML += 'saving post failed';
        }
    }

}
