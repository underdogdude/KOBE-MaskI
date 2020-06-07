const video = document.getElementById("inputVideo");
var emoji_sad = document.getElementById("sad");
var emoji_angry = document.getElementById("angry");
var emoji_natural = document.getElementById("natural");
try {
    window.AppInventor.setWebViewString("js load5");
} catch (err) {
    console.log(err);
}
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(run);

var timer = 1000;
var count = 0;

// Sad and Angry
let detectExpressions = async (result) => {
    // detect expression
    console.log(result);

    if (typeof result !== "undefined") {
        let sad = 0,
            anger = 0;
        console.log(result);
        if (result.expressions.hasOwnProperty("sad")) {
            sad = result.expressions.sad;
        }
        if (result.expressions.hasOwnProperty("angry")) {
            anger = result.expressions.angry;
        }

        if (sad > 0.7) {
            count += 1;
            onExpression("sad");
            if (count === 3) {
                alert("you really sad");
                window.AppInventor.setWebViewString("sad");
            }
        } else if (anger > 0.7) {
            count += 1;
            onExpression("angry");
            if (count === 3) {
                alert("you really angry");
                window.AppInventor.setWebViewString("angry");
            }
        } else {
            count = 0;
            onExpression("natural");
        }
    }
};

function onExpression(emotion) {
    if (emotion === "sad") {
        emoji_sad.style.display = "block";
        emoji_angry.style.display = "none";
        emoji_natural.style.display = "none";
    } else if (emotion === "angry") {
        emoji_sad.style.display = "none";
        emoji_angry.style.display = "block";
        emoji_natural.style.display = "none";
    } else {
        emoji_sad.style.display = "none";
        emoji_angry.style.display = "none";
        emoji_natural.style.display = "block";
    }
}

async function onPlay() {
    
    const videoEl = $("#inputVideo").get(0);
    let displaySize = {
        width: $('#inputVideo').width(),
        height: $('#inputVideo').height()
    };

    if (videoEl.paused || videoEl.ended) return setTimeout(() => onPlay());

    let result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

    detectExpressions(result);
    if (result) {
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, videoEl, true)
        const resizedResult = faceapi.resizeResults(result,displaySize);
        const minConfidence = 0.05
        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
    }
    setTimeout(() => onPlay(), 1000);
}

async function run() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    const videoEl = $("#inputVideo").get(0);
    videoEl.srcObject = stream;
}
