const video = document.getElementById("video");
var emoji_sad =  document.getElementById("sad");
var emoji_angry =  document.getElementById("angry");
var emoji_natural =  document.getElementById("natural");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        (stream) => (video.srcObject = stream),
        (err) => console.error(err)
    );
}
var timer = 1000;
var count = 0;
video.addEventListener("play", () => {
   
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        detectExpressions(video);

        // Show on Canvas
        const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, timer);
});

// Sad and Angry
let detectExpressions = async (video) => {
    // detect expression

    let result =await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();



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
            if(count === 3) { 
                alert('you really sad');
            }
        } else if (anger > 0.7) {
            count += 1;
            onExpression("angry");
            if(count === 3) { 
                alert('you really angry');
            }
        } else { 
            count = 0;
            onExpression("natural");
        }
    }
};


function onExpression(emotion) { 
    if(emotion === "sad") { 
        emoji_sad.style.display = "block";
        emoji_angry.style.display = "none";
        emoji_natural.style.display = "none";
    }
    else if(emotion === "angry") { 
        emoji_sad.style.display = "none";
        emoji_angry.style.display = "block";
        emoji_natural.style.display = "none";
    }else { 
        emoji_sad.style.display = "none";
        emoji_angry.style.display = "none";
        emoji_natural.style.display = "block";
    }
}
