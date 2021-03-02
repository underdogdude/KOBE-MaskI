const video = document.getElementById("inputVideo");
var emoji_sad = document.getElementById("sad");
var emoji_angry = document.getElementById("angry");
var emoji_natural = document.getElementById("natural");

var emotions_elems = document.getElementById("emotions");
var main_emotions_elems = document.getElementById("main_emotion");

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
        // display one emotion footer
        var string = "";
        for (var key in result.expressions) {
            if (result.expressions.hasOwnProperty(key)) {
                if (result.expressions[key] >= 0.2 && result.expressions[key] <= 1) {
                    string += `<div class="emotion">
                        <img src="./img/emoji/${key}.png" width="40px" />
                        <span class="emotion--name"> ${key} </span>
                        <span class="emotion--score"> ${result.expressions[key].toFixed(2)} </span>
                    </div>`
                }
            }
        }

        var maxValue = Math.max.apply(null,Object.keys(result.expressions).map((o) => result.expressions[o]) );
        console.log(maxValue);
        var maxEmotion = Object.keys(result.expressions).find((o) => result.expressions[o] === maxValue); 
        var stringEmotion = `<img src="./img/emoji/${maxEmotion}.png" width="90%" /> <h1 class="text--capital m-color">${maxEmotion}</h1>`;
        $(main_emotions_elems).html(stringEmotion);
        $(emotions_elems).html(string);

        // if (result.expressions.hasOwnProperty("sad")) {
        //     sad = result.expressions.sad;
        // }
        // if (result.expressions.hasOwnProperty("angry")) {
        //     anger = result.expressions.angry;
        // }
        // if (sad > 0.7) {
        //     count += 1;
        //     onExpression("sad");
        //     if (count === 3) {
        //         alert("you really sad");
        //     }
        // } else if (anger > 0.7) {
        //     count += 1;
        //     onExpression("angry");
        //     if (count === 3) {
        //         alert("you really angry");
        //     }
        // } else {
        //     count = 0;
        //     onExpression("natural");
        // }
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
        const dims = faceapi.matchDimensions(canvas, displaySize, true)
        const resizedResult = faceapi.resizeResults(result,displaySize);
        const minConfidence = 0.3
        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
    }
    setTimeout(() => onPlay(), 2000);
}

async function run() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    const videoEl = $("#inputVideo").get(0);
    videoEl.srcObject = stream;
}
