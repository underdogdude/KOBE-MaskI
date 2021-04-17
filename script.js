const video = document.getElementById("inputVideo");
var emoji_sad = document.getElementById("sad");
var emoji_angry = document.getElementById("angry");
var emoji_natural = document.getElementById("natural");

var emotions_elems = document.getElementById("emotions");
var main_emotions_elems = document.getElementById("main_emotion");

// Record 
var is_record = 0;
var record_value = "";

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(run);

var timer = 1000;
var count = 0;
var trigg = {
    emotion: "",
    timer: 1,
    soundTimer: 1
}
// Sad and Angry
let detectExpressions = async (result) => {
    // detect expression

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
                    </div>`;
                    
                    if(trigg.emotion === key){ 
                        trigg.timer +=1
                    }else { 
                        trigg.timer = 0;
                        trigg.emotion = key;
                    }
                }
            }
        }

        var maxValue = Math.max.apply(null,Object.keys(result.expressions).map((o) => result.expressions[o]) );
        console.log(maxValue);
        var maxEmotion = Object.keys(result.expressions).find((o) => result.expressions[o] === maxValue); 
        
        if (is_record === 1) { 
            record_value += maxEmotion + " (" + maxValue + ")" + "\n"; 
        }
        console.log(maxEmotion);

        var stringEmotion = "";
        switch (maxEmotion) { 
            case "angry" :
                stringEmotion = `<img src="./img/emoji/angry.svg" width="90%" /> <h1 class="text--capital">${maxEmotion}</h1>`;
                break;
                
            case "sad" :
                stringEmotion = `<img src="./img/emoji/sad.svg" width="90%" /> <h1 class="text--capital">${maxEmotion}</h1>`;
                break;
                
            case "fearful" :
                stringEmotion = `<img src="./img/emoji/fearful.svg" width="90%" /> <h1 class="text--capital">${maxEmotion}</h1>`;
                break;
                
            default: 
            stringEmotion = `<img src="./img/emoji/neutral.svg" width="90%" />`;
                break;
        }
       
        $(main_emotions_elems).html(stringEmotion);
        $(emotions_elems).html(string);
    }
    if(trigg.timer > 3){ 
        await sleep(5000, trigg.emotion).then(() => {
            // Do something after the sleep!
            audio.pause();
            audio.currentTime = 0;
        });
    }
};


var audio = new Audio('./calm.mp3');
function sleep(ms, emotion) {
    switch(emotion){ 
        case "angry":
            audio.play();
            break;
        case "fearful":
            audio.play();
            break;
        case "sad":
            audio.play();
            break;
        default:
            break; 
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
    setTimeout(() => onPlay(), 1000);
}

async function run() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    const videoEl = $("#inputVideo").get(0);
    videoEl.srcObject = stream;
}


function record () { 

    var elem = document.getElementById('record_btn');
    if (is_record === 0) { 
        console.log('bite');
        elem.innerHTML = "&#9725;";
        elem.classList.add("active");
        is_record = 1
    }else { 
        elem.innerHTML = "Rec";
        elem.classList.remove("active");
        is_record = 0
        console.log(record_value);
        record_value ="";
    }
}
