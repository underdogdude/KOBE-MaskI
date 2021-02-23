let forwardTimes = [];
let withFaceLandmarks = false;
let withBoxes = true;
let withFacialExpression = true;

async function run() {

    const net = new faceapi.SsdMobilenetv1()
    await net.loadFromUri('./models');
    await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
    await faceapi.nets.faceExpressionNet.loadFromUri("./models");
    console.log(net, 'net')
    onPlay($('#inputVideo').get(0))
}
run();

function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30);
    const avgTimeInMs =
        forwardTimes.reduce((total, t) => total + t) / forwardTimes.length;
    $("#time").val(`${Math.round(avgTimeInMs)} ms`);
    $("#fps").val(`${faceapi.utils.round(1000 / avgTimeInMs)}`);
}

async function onPlay(videoEl) {
    if (
        !videoEl.currentTime ||
        videoEl.paused ||
        videoEl.ended 
    )
        return setTimeout(() => onPlay(videoEl));

    const ts = Date.now();

    let results = await faceapi
    .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();
    
    // detectExpressions(results);
    if (results) {
        
        console.log('have results', results);
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, videoEl, true)
        const resizedResult = faceapi.resizeResults(results,dims);
        const minConfidence = 0.3
        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
    }

    updateTimeStats(Date.now() - ts);
    setTimeout(() => onPlay(videoEl));
}

function updateResults() {}

