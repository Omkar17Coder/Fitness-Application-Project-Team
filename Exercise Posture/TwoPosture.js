// This code Has two models that can detect two exercise Set.

// It has Inbuilt Model Switch, After 15 Iterations of model -1 it moves to model-2

let poseNet;
let model1;
let model2;
let currentModel;
let switchInterval = 250; // Switch interval in milliseconds
let currentLabel = '';
let isClassifying = true; // Flag to control classification
let video;
let skeleton;
let pose;
let totalCountsNeeded=30;
let GlobalBool=false;

let currentPos='a';

// in this file currently we will detect one posture.
let currPoseCount=0;
let index=0;
// index points to which we need to take.
// 0 is for squart posture and 1 is for tree posture.
// currently build for only one posture.
let timer=250;
let  flag=true;
function setup() {
    // Create a poseNet instance


    poseNet = ml5.poseNet();

    // Create neural network instances
    model1 = ml5.neuralNetwork();
    model2 = ml5.neuralNetwork();
    currentModel = model1; // Start with the first model

    // Load or train your neural network models as needed
    const folderName1 = 1;
    const modelInfo1 = { // this is squarts posture.
        model: `Models/model.json`,
        metadata: `Models/model_meta.json`,
        weights: `Models/model.weights.bin`,
    };
    model1.load(modelInfo1, modelLoaded); // this loads the squarts posture.

    const folderName2 = 2;
    const modelInfo2 = { // this loads the Lunges Posture.
        model: `Models/model(1).json`,
        metadata: `Models/model_meta(1).json`,
        weights: `Models/model.weights(1).bin`,
    };
    model2.load(modelInfo2, modelLoaded);

    // Create a video capture
    video = createCapture(VIDEO);
    video.size(640, 480);

    video.hide();

    // Set up the canvas for pose detection
    const poseCanvas = createCanvas(640, 480);


    poseNet = ml5.poseNet(video, ()=>{
        console.log("MOdel Ready to so");
    });
    // Listen for pose events
    poseNet.on('pose', (results) => {
        if(results.length>0) {
            pose = results[0]["pose"];
            skeleton=results[0].skeleton;
        }
    });
    poseInfoDiv = createDiv();
    poseInfoDiv.style('background-color', 'blue');
    poseInfoDiv.style('color', 'white');
    poseInfoDiv.style('padding', '10px');
    poseInfoDiv.style('text-align', 'center');
    poseInfoDiv.style('font-size', '24px'); // Adjust the font size
    poseInfoDiv.style('font-weight', 'bold'); // Make the text bold
    poseInfoDiv.style('margin-top', '20px');

    // Set a timer to switch models after a certain interval

}


function draw() {
    // Display the video feed on the canvas
    push();
    translate(video.width,0);
    scale(-1,1);
    image(video, 0, 0, video.width, video.height);

    // Draw poses on the canvas
    drawPose();

    // Classify the pose using the neural network
    classifyPose();

    // Display information on the canvas
    fill(255);
    textSize(24);
    textAlign(CENTER, TOP);
    text(`Current Pose: ${currentLabel}`, 10000,100);
    text(`Pose Timer: ${switchInterval / 1000}`, width / 2, 50);
}

function drawPose() {

    if(pose){

        for(let i=0;i<skeleton.length;i++){
            let a=skeleton[i][0];
            let b=skeleton[i][1];
            strokeWeight(8);
            stroke(244,194,194);
            line(a.position.x,a.position.y,b.position.x,b.position.y);
        }
        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0);
            stroke(255);
            ellipse(x, y, 16, 16);
        }
    }
    pop();

}

function gotPoses(results) {

}

function classifyPose() {

    // First Implement the squart posture.

    if(totalCountsNeeded===currPoseCount){
        flag=false;
    }

    if (flag) {

        if (isClassifying && pose) {

            // if (timer <= 0) {
            //     flag = false;
            // }

            isClassifying = false; // Disable classification during the switch

            let inputs = [];

            for (let i = 0; i < pose.keypoints.length; i++) {
                let x = pose.keypoints[i].position.x;
                let y = pose.keypoints[i].position.y;
                inputs.push(x);
                inputs.push(y);
            }

            currentModel.classify(inputs, gotResult);
        } else {
            setTimeout(() => {
                isClassifying = true; // Re-enable classification
                classifyPose();
            }, 100);
        }

    }
    else {

        flag = false;
        switchModels();
        flag = true;


    }

}

function gotResult(error, results) {




    if (error) {
        console.error(error);
        isClassifying = true; // Re-enable classification on error
        return;
    }

    // Get the current label from the classification results
    currentLabel = results[0].label;
    console.log(currentLabel);

    if(currentLabel==='a' && currentPos==='a'){
        // User is in standing ,
        // now needs to go to bending.

        // this can be used with anything ,

        if(GlobalBool){
            // initally false will be set true by bending.
            currPoseCount++;
            GlobalBool=false;
        }
        currentPos='b'; // he needs to do bending.

    }
    else if(currentLabel=='b' && currentPos==='b'){
        // did bending now standing.
        currentPos='a';
        GlobalBool=true;
    }

    if(currentPos
    )
        poseInfoDiv.html(`Current Pose: ${currentLabel}<br>Pose Timer: ${currPoseCount}`);

    isClassifying = true;

}// Re-enable classification after processing results


function switchModels() {


    if (currentModel === model1) {
        currentModel = model2;
        console.log('Switched to Model 2');
    } else {
        currentModel = model1;
        console.log('Switched to Model 1');
    }

    // Re-enable classification after the switch
    isClassifying = true;
}

function modelLoaded() {
    console.log('Neural Network Model Loaded!');
}

// Call the setup function when the page is loaded

