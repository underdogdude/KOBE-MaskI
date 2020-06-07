const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        (stream) => (video.srcObject = stream),
        (err) => console.error(err)
    );
}

video.addEventListener("play", () => {
    // detectExpressions();
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
        const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
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
        if (result.expressions.hasOwnProperty("sad")) {
            sad = result.expressions.sad;
        }
        if (result.expressions.hasOwnProperty("angry")) {
            anger = result.expressions.angry;
        }

        if (sad > 0.7) {
            onExpression("sad");
        } else if (anger > 0.7) {
            onExpression("angry");
        }
    }
};


function onExpression(emotion) { 
    if(emotion === "sad") { 
        document.getElementById("emotion_container").innerHTML = "SAD!";
    }
    else if(emotion === "angry") { 
        document.getElementById("emotion_container").innerHTML = "ANGRY!";
    }else { 
        document.getElementById("emotion_container").innerHTML = "...!";
    }
}