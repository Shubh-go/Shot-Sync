// ====================== GLOBAL STATE ======================
let benchmarkPoseData = [];
let userPoseData = [];
let benchmarkStream = null;
let userStream = null;
let benchmarkCamera = null;
let userCamera = null;
let comparisonChart = null;
let benchmarkRenderLoopId = null;
let userRenderLoopId = null;

// MediaPipe Pose
let benchmarkPose = null;
let userPose = null;

// MediaPipe Pose Connections (33 landmarks)
const POSE_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10],
    [11, 12],
    [11, 13], [13, 15], [15, 17], [17, 19], [19, 15], [15, 21],
    [12, 14], [14, 16], [16, 18], [18, 20], [20, 16], [16, 22],
    [11, 23], [12, 24],
    [23, 24],
    [23, 25], [25, 27], [27, 29], [29, 31], [31, 27],
    [24, 26], [26, 28], [28, 30], [30, 32], [32, 28]
];

// Simple drawing functions if MediaPipe's aren't available
function drawConnections(ctx, landmarks, connections, options = {}) {
    const color = options.color || '#00FF00';
    const lineWidth = options.lineWidth || 2;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    for (const [startIdx, endIdx] of connections) {
        if (startIdx < landmarks.length && endIdx < landmarks.length) {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
                ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
                ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
            }
        }
    }
    ctx.stroke();
}

function drawLandmarks(ctx, landmarks, options = {}) {
    const color = options.color || '#00FF00';
    const radius = options.radius || 3;
    
    ctx.fillStyle = color;
    
    for (const landmark of landmarks) {
        if (landmark && landmark.visibility > 0.5) {
            ctx.beginPath();
            ctx.arc(
                landmark.x * ctx.canvas.width,
                landmark.y * ctx.canvas.height,
                radius,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }
}

// ====================== MEDIAPIPE SETUP ======================

function initializePose() {
    // Initialize MediaPipe Pose
    const poseOptions = {
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    };
    
    benchmarkPose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });
    
    userPose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });
    
    benchmarkPose.setOptions(poseOptions);
    userPose.setOptions(poseOptions);
}

// ====================== UTILITY FUNCTIONS ======================

function get3DPoint(landmarks, index, width, height) {
    if (!landmarks || index >= landmarks.length || landmarks[index].visibility < 0.5) {
        return null;
    }
    return [
        landmarks[index].x * width,
        landmarks[index].y * height,
        landmarks[index].z || 0
    ];
}

function calculateAngle(a, b, c) {
    if (!a || !b || !c) return null;
    
    const ba = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
    
    const dot = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
    const magBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2]);
    const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1] + bc[2] * bc[2]);
    
    if (magBA < 1e-5 || magBC < 1e-5) return null;
    
    const cosine = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
    return Math.acos(cosine) * (180 / Math.PI);
}

function getArmState(landmarks, width, height) {
    const rightShoulder = get3DPoint(landmarks, 12, width, height);
    const rightElbow = get3DPoint(landmarks, 14, width, height);
    const rightWrist = get3DPoint(landmarks, 16, width, height);
    const leftWrist = get3DPoint(landmarks, 15, width, height);
    const leftHip = get3DPoint(landmarks, 23, width, height);
    const rightHip = get3DPoint(landmarks, 24, width, height);

    if (rightWrist && leftWrist && leftHip && rightHip && rightShoulder) {
        const waistY = (leftHip[1] + rightHip[1]) / 2.0;
        const avgWristY = (rightWrist[1] + leftWrist[1]) / 2.0;
        const distWrists = Math.sqrt(
            Math.pow(rightWrist[0] - leftWrist[0], 2) +
            Math.pow(rightWrist[1] - leftWrist[1], 2) +
            Math.pow(rightWrist[2] - leftWrist[2], 2)
        );
        
        if (distWrists < 0.15 * width && avgWristY < waistY && rightWrist[1] > rightShoulder[1]) {
            return "pre_shot";
        }
    }

    if (rightWrist && rightShoulder) {
        if (rightShoulder[1] > rightWrist[1]) {
            return "follow_through";
        }
    }

    if (rightShoulder && rightWrist) {
        if (rightWrist[1] > rightShoulder[1]) {
            return "neutral";
        }
    }

    return "neutral";
}

// ====================== VIDEO CAPTURE ======================

async function startBenchmarkRecording() {
    try {
        const video = document.getElementById('benchmarkVideo');
        const canvas = document.getElementById('benchmarkOutput');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 640;
        canvas.height = 480;
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 }, 
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        
        benchmarkStream = stream;
        video.srcObject = stream;
        video.play(); // Ensure video plays even though it's hidden
        
        // Wait for video to be ready and playing
        await new Promise((resolve) => {
            const checkReady = () => {
                if (video.readyState >= 2 && video.videoWidth > 0) {
                    video.play().then(() => {
                        console.log('Video playing');
                        resolve();
                    }).catch(err => {
                        console.error('Video play error:', err);
                        resolve(); // Continue anyway
                    });
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            video.onloadedmetadata = checkReady;
            checkReady();
        });
        
        benchmarkPoseData = [];
        
        let previousStage = "neutral";
        let startTime = null;
        let recordingActive = false;
        let seenFollowThrough = false;
        const lastPrintTime = { value: Date.now() };
        
        document.getElementById('startBenchmark').disabled = true;
        document.getElementById('stopBenchmark').disabled = false;
        document.getElementById('benchmarkStatus').textContent = 'Recording...';
        document.getElementById('benchmarkStatus').className = 'status recording';
        
        // Store current pose landmarks for drawing
        let currentPoseLandmarks = null;
        let renderLoopId = null;
        
        // Separate rendering loop for continuous video display - runs at 60fps
        const renderLoop = () => {
            try {
                if (video.readyState >= 2 && !video.paused && video.videoWidth > 0) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Draw pose overlay if available
                    if (currentPoseLandmarks) {
                        drawConnections(ctx, currentPoseLandmarks, POSE_CONNECTIONS, {
                            color: '#00FF00',
                            lineWidth: 2
                        });
                        drawLandmarks(ctx, currentPoseLandmarks, {
                            color: '#00FF00',
                            lineWidth: 1,
                            radius: 3
                        });
                    }
                }
            } catch (error) {
                console.error('Render error:', error);
            }
            renderLoopId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        
        benchmarkPose.onResults((results) => {
            // Store landmarks for rendering
            currentPoseLandmarks = results.poseLandmarks;
            
            if (results.poseLandmarks) {
                
                const state = getArmState(results.poseLandmarks, canvas.width, canvas.height);
                const currentTime = Date.now() / 1000.0;
                
                // Compute angles
                const rightShoulder = get3DPoint(results.poseLandmarks, 12, canvas.width, canvas.height);
                const rightElbow = get3DPoint(results.poseLandmarks, 14, canvas.width, canvas.height);
                const rightWrist = get3DPoint(results.poseLandmarks, 16, canvas.width, canvas.height);
                const rightIndex = get3DPoint(results.poseLandmarks, 20, canvas.width, canvas.height);
                const leftShoulder = get3DPoint(results.poseLandmarks, 11, canvas.width, canvas.height);
                
                const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
                const wristAngle = calculateAngle(rightElbow, rightWrist, rightIndex);
                const armAngle = calculateAngle(leftShoulder, rightShoulder, rightElbow);
                
                // Store landmarks
                const landmarks3D = [];
                for (let i = 0; i < 33; i++) {
                    const pt = get3DPoint(results.poseLandmarks, i, canvas.width, canvas.height);
                    landmarks3D.push(pt || [NaN, NaN, NaN]);
                }
                
                // Stage transitions
                if (state !== previousStage) {
                    if (state === "pre_shot" && !recordingActive) {
                        recordingActive = true;
                        seenFollowThrough = false;
                        startTime = currentTime;
                        benchmarkPoseData = [];
                        lastPrintTime.value = currentTime;
                    } else if (state === "neutral" && recordingActive && !seenFollowThrough) {
                        recordingActive = false;
                        seenFollowThrough = false;
                        startTime = null;
                        benchmarkPoseData = [];
                    } else if (state === "follow_through" && recordingActive) {
                        seenFollowThrough = true;
                    } else if (state === "pre_shot" && recordingActive && seenFollowThrough) {
                        const elapsed = currentTime - startTime;
                        benchmarkPoseData.push({
                            state: state,
                            time: elapsed,
                            elbow_angle: elbowAngle,
                            wrist_angle: wristAngle,
                            arm_angle: armAngle,
                            landmarks: landmarks3D
                        });
                        stopBenchmarkRecording();
                        return;
                    }
                    previousStage = state;
                }
                
                // Record while actively recording
                if (recordingActive) {
                    const elapsed = currentTime - startTime;
                    benchmarkPoseData.push({
                        state: state,
                        time: elapsed,
                        elbow_angle: elbowAngle,
                        wrist_angle: wristAngle,
                        arm_angle: armAngle,
                        landmarks: landmarks3D
                    });
                    
                    if (state === "pre_shot" || state === "follow_through") {
                        if (currentTime - lastPrintTime.value >= 0.1) {
                            lastPrintTime.value = currentTime;
                        }
                    }
                }
            }
        });
        
        // Use MediaPipe Camera utility for proper frame processing
        benchmarkCamera = new Camera(video, {
            onFrame: async () => {
                try {
                    await benchmarkPose.send({image: video});
                } catch (error) {
                    console.error('Error processing frame:', error);
                }
            },
            width: 640,
            height: 480
        });
        benchmarkCamera.start();
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        document.getElementById('benchmarkStatus').textContent = 'Error accessing camera. Please allow camera permissions.';
        document.getElementById('benchmarkStatus').className = 'status error';
    }
}

function stopBenchmarkRecording() {
    // Stop render loop
    if (benchmarkRenderLoopId !== null) {
        cancelAnimationFrame(benchmarkRenderLoopId);
        benchmarkRenderLoopId = null;
    }
    
    if (benchmarkCamera) {
        benchmarkCamera.stop();
        benchmarkCamera = null;
    }
    
    if (benchmarkStream) {
        benchmarkStream.getTracks().forEach(track => track.stop());
        benchmarkStream = null;
    }
    
    document.getElementById('startBenchmark').disabled = false;
    document.getElementById('stopBenchmark').disabled = true;
    
    if (benchmarkPoseData.length > 0) {
        document.getElementById('benchmarkStatus').textContent = `Recorded ${benchmarkPoseData.length} frames.`;
        document.getElementById('benchmarkStatus').className = 'status success';
        document.getElementById('retakeBenchmark').style.display = 'inline-block';
        
        // Move to step 2
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').classList.add('active');
        document.getElementById('step2').style.display = 'block';
    }
}

async function startUserRecording() {
    try {
        const video = document.getElementById('userVideo');
        const canvas = document.getElementById('userOutput');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 640;
        canvas.height = 480;
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 }, 
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        
        userStream = stream;
        video.srcObject = stream;
        video.play(); // Ensure video plays even though it's hidden
        
        // Wait for video to be ready and playing
        await new Promise((resolve) => {
            const checkReady = () => {
                if (video.readyState >= 2 && video.videoWidth > 0) {
                    video.play().then(() => {
                        console.log('Video playing');
                        resolve();
                    }).catch(err => {
                        console.error('Video play error:', err);
                        resolve(); // Continue anyway
                    });
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            video.onloadedmetadata = checkReady;
            checkReady();
        });
        
        userPoseData = [];
        
        let previousStage = "neutral";
        let startTime = null;
        let recordingActive = false;
        let seenFollowThrough = false;
        const lastPrintTime = { value: Date.now() };
        
        document.getElementById('startUser').disabled = true;
        document.getElementById('stopUser').disabled = false;
        document.getElementById('userStatus').textContent = 'Recording...';
        document.getElementById('userStatus').className = 'status recording';
        
        // Store current pose landmarks for drawing
        let currentPoseLandmarks = null;
        let renderLoopId = null;
        
        // Separate rendering loop for continuous video display - runs at 60fps
        const renderLoop = () => {
            try {
                if (video.readyState >= 2 && !video.paused && video.videoWidth > 0) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Draw pose overlay if available
                    if (currentPoseLandmarks) {
                        drawConnections(ctx, currentPoseLandmarks, POSE_CONNECTIONS, {
                            color: '#00FF00',
                            lineWidth: 2
                        });
                        drawLandmarks(ctx, currentPoseLandmarks, {
                            color: '#00FF00',
                            lineWidth: 1,
                            radius: 3
                        });
                    }
                }
            } catch (error) {
                console.error('Render error:', error);
            }
            renderLoopId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        
        userPose.onResults((results) => {
            // Store landmarks for rendering
            currentPoseLandmarks = results.poseLandmarks;
            
            if (results.poseLandmarks) {
                
                const state = getArmState(results.poseLandmarks, canvas.width, canvas.height);
                const currentTime = Date.now() / 1000.0;
                
                const rightShoulder = get3DPoint(results.poseLandmarks, 12, canvas.width, canvas.height);
                const rightElbow = get3DPoint(results.poseLandmarks, 14, canvas.width, canvas.height);
                const rightWrist = get3DPoint(results.poseLandmarks, 16, canvas.width, canvas.height);
                const rightIndex = get3DPoint(results.poseLandmarks, 20, canvas.width, canvas.height);
                const leftShoulder = get3DPoint(results.poseLandmarks, 11, canvas.width, canvas.height);
                
                const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
                const wristAngle = calculateAngle(rightElbow, rightWrist, rightIndex);
                const armAngle = calculateAngle(leftShoulder, rightShoulder, rightElbow);
                
                const landmarks3D = [];
                for (let i = 0; i < 33; i++) {
                    const pt = get3DPoint(results.poseLandmarks, i, canvas.width, canvas.height);
                    landmarks3D.push(pt || [NaN, NaN, NaN]);
                }
                
                if (state !== previousStage) {
                    if (state === "pre_shot" && !recordingActive) {
                        recordingActive = true;
                        seenFollowThrough = false;
                        startTime = currentTime;
                        userPoseData = [];
                        lastPrintTime.value = currentTime;
                    } else if (state === "neutral" && recordingActive && !seenFollowThrough) {
                        recordingActive = false;
                        seenFollowThrough = false;
                        startTime = null;
                        userPoseData = [];
                    } else if (state === "follow_through" && recordingActive) {
                        seenFollowThrough = true;
                    } else if (state === "pre_shot" && recordingActive && seenFollowThrough) {
                        const elapsed = currentTime - startTime;
                        userPoseData.push({
                            state: state,
                            time: elapsed,
                            elbow_angle: elbowAngle,
                            wrist_angle: wristAngle,
                            arm_angle: armAngle,
                            landmarks: landmarks3D
                        });
                        stopUserRecording();
                        return;
                    }
                    previousStage = state;
                }
                
                if (recordingActive) {
                    const elapsed = currentTime - startTime;
                    userPoseData.push({
                        state: state,
                        time: elapsed,
                        elbow_angle: elbowAngle,
                        wrist_angle: wristAngle,
                        arm_angle: armAngle,
                        landmarks: landmarks3D
                    });
                    
                    if (state === "pre_shot" || state === "follow_through") {
                        if (currentTime - lastPrintTime.value >= 0.1) {
                            lastPrintTime.value = currentTime;
                        }
                    }
                }
            }
        });
        
        // Use MediaPipe Camera utility for proper frame processing
        userCamera = new Camera(video, {
            onFrame: async () => {
                try {
                    await userPose.send({image: video});
                } catch (error) {
                    console.error('Error processing frame:', error);
                }
            },
            width: 640,
            height: 480
        });
        userCamera.start();
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        document.getElementById('userStatus').textContent = 'Error accessing camera. Please allow camera permissions.';
        document.getElementById('userStatus').className = 'status error';
    }
}

function stopUserRecording() {
    // Stop render loop
    if (userRenderLoopId !== null) {
        cancelAnimationFrame(userRenderLoopId);
        userRenderLoopId = null;
    }
    
    if (userCamera) {
        userCamera.stop();
        userCamera = null;
    }
    
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
        userStream = null;
    }
    
    document.getElementById('startUser').disabled = false;
    document.getElementById('stopUser').disabled = true;
    
    if (userPoseData.length > 0) {
        document.getElementById('userStatus').textContent = `Recorded ${userPoseData.length} frames. Analyzing...`;
        document.getElementById('userStatus').className = 'status success';
        document.getElementById('retakeUser').style.display = 'inline-block';
        
        compareShots();
    }
}

// ====================== SHOT COMPARISON ======================

function computeOverallForm(e, w, a) {
    const angles = [];
    if (e !== null && e !== undefined) angles.push(e);
    if (w !== null && w !== undefined) angles.push(w);
    if (a !== null && a !== undefined) angles.push(a);
    if (angles.length === 0) return null;
    return angles.reduce((a, b) => a + b, 0) / angles.length;
}

function extractFormSeries(shotData) {
    const times = [];
    const formVals = [];
    for (const entry of shotData) {
        const measure = computeOverallForm(entry.elbow_angle, entry.wrist_angle, entry.arm_angle);
        if (measure !== null) {
            times.push(entry.time);
            formVals.push(measure);
        }
    }
    return { times, formVals };
}

// Simple DTW implementation
function dtw(series1, series2) {
    const n = series1.length;
    const m = series2.length;
    const dtwMatrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
    dtwMatrix[0][0] = 0;
    
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = Math.abs(series1[i - 1] - series2[j - 1]);
            dtwMatrix[i][j] = cost + Math.min(
                dtwMatrix[i - 1][j],
                dtwMatrix[i][j - 1],
                dtwMatrix[i - 1][j - 1]
            );
        }
    }
    
    // Build path
    const path = [];
    let i = n, j = m;
    while (i > 0 && j > 0) {
        path.unshift([i - 1, j - 1]);
        const prev = [
            dtwMatrix[i - 1][j],
            dtwMatrix[i][j - 1],
            dtwMatrix[i - 1][j - 1]
        ];
        const minIdx = prev.indexOf(Math.min(...prev));
        if (minIdx === 0) i--;
        else if (minIdx === 1) j--;
        else { i--; j--; }
    }
    
    return { distance: dtwMatrix[n][m], path };
}

function computeUserCloseness(benchForm, userForm, path) {
    const alpha = 2.0;
    const userMap = {};
    
    for (const [i, j] of path) {
        if (!userMap[j]) userMap[j] = [];
        userMap[j].push(i);
    }
    
    const userCloseness = [];
    for (let j = 0; j < userForm.length; j++) {
        if (userMap[j]) {
            const iList = userMap[j];
            const iMid = iList[Math.floor(iList.length / 2)];
            const diff = Math.abs(userForm[j] - benchForm[iMid]);
            const score = Math.max(0, Math.min(100, 100 - alpha * diff));
            userCloseness.push(score);
        } else {
            userCloseness.push(100);
        }
    }
    return userCloseness;
}

function getEventAngles(shotData, times, eventIdx) {
    if (times.length === 0 || shotData.length === 0) {
        return { elbow: null, wrist: null, arm: null };
    }
    
    let targetIdx;
    if (eventIdx === 0) {
        targetIdx = 0;
    } else if (eventIdx === 1) {
        targetIdx = Math.floor(times.length / 3);
    } else if (eventIdx === 2) {
        targetIdx = Math.floor((2 * times.length) / 3);
    } else {
        targetIdx = times.length - 1;
    }
    
    if (targetIdx < shotData.length) {
        const entry = shotData[targetIdx];
        return {
            elbow: entry.elbow_angle,
            wrist: entry.wrist_angle,
            arm: entry.arm_angle
        };
    }
    return { elbow: null, wrist: null, arm: null };
}

function generateFeedback(benchmarkData, userData, benchTimes, userTimes, userCloseness) {
    const feedback = [];
    
    // 1. Overall score
    const avgCloseness = userCloseness.reduce((a, b) => a + b, 0) / userCloseness.length;
    feedback.push(`Overall Score: ${avgCloseness.toFixed(1)}%`);
    
    if (avgCloseness >= 90) {
        feedback.push("Excellent form! Your shot closely matches the benchmark.");
    } else if (avgCloseness >= 75) {
        feedback.push("Good form with room for improvement.");
    } else if (avgCloseness >= 60) {
        feedback.push("Your form needs work. Focus on key areas below.");
    } else {
        feedback.push("Significant differences detected. Review the specific feedback below.");
    }
    
    // 2. Timing comparison
    if (benchTimes.length > 1 && userTimes.length > 1) {
        const benchDuration = benchTimes[benchTimes.length - 1] - benchTimes[0];
        const userDuration = userTimes[userTimes.length - 1] - userTimes[0];
        if (benchDuration > 0 && userDuration > 0) {
            const timeDiffPct = ((userDuration - benchDuration) / benchDuration) * 100;
            if (Math.abs(timeDiffPct) > 10) {
                if (timeDiffPct > 0) {
                    feedback.push(`⏱️ TIMING: Your shot is ${timeDiffPct.toFixed(1)}% slower than the benchmark. Try to maintain a quicker, more fluid motion.`);
                } else {
                    feedback.push(`⏱️ TIMING: Your shot is ${Math.abs(timeDiffPct).toFixed(1)}% faster than the benchmark. Consider slowing down slightly for better control.`);
                }
            }
        }
    }
    
    // 3. Key event comparison
    const eventNames = ["Start", "Ball Set", "Release", "Follow Through"];
    const eventIssues = [];
    
    for (let i = 0; i < eventNames.length; i++) {
        const benchAngles = getEventAngles(benchmarkData, benchTimes, i);
        const userAngles = getEventAngles(userData, userTimes, i);
        
        if (benchAngles.elbow !== null && userAngles.elbow !== null) {
            const elbowDiff = Math.abs(userAngles.elbow - benchAngles.elbow);
            const wristDiff = userAngles.wrist !== null && benchAngles.wrist !== null 
                ? Math.abs(userAngles.wrist - benchAngles.wrist) : 0;
            const armDiff = userAngles.arm !== null && benchAngles.arm !== null 
                ? Math.abs(userAngles.arm - benchAngles.arm) : 0;
            
            // Basketball-specific actionable feedback
            if (eventNames[i] === "Follow Through") {
                // Wrist snap analysis
                if (userAngles.wrist !== null && benchAngles.wrist !== null && wristDiff > 10) {
                    if (userAngles.wrist > benchAngles.wrist + 5) {
                        eventIssues.push(`💪 ${eventNames[i]}: Your wrist isn't snapping hard enough. Actively snap your wrist forward at release for better follow-through and shot power.`);
                    } else if (userAngles.wrist < benchAngles.wrist - 5) {
                        eventIssues.push(`💪 ${eventNames[i]}: Your wrist is over-extending. Focus on a controlled snap - not too hard, not too soft.`);
                    }
                }
                
                // Elbow extension
                if (elbowDiff > 10) {
                    if (userAngles.elbow > benchAngles.elbow + 5) {
                        eventIssues.push(`💪 ${eventNames[i]}: Keep your arm fully extended after release. Don't let your elbow collapse - maintain full extension for better arc.`);
                    } else if (userAngles.elbow < benchAngles.elbow - 5) {
                        eventIssues.push(`💪 ${eventNames[i]}: Your arm is too straight. Maintain a slight natural bend even at full extension.`);
                    }
                }
            } else if (eventNames[i] === "Release") {
                // Wrist position at release
                if (userAngles.wrist !== null && benchAngles.wrist !== null && wristDiff > 10) {
                    if (userAngles.wrist > benchAngles.wrist + 5) {
                        eventIssues.push(`🎯 ${eventNames[i]}: Your wrist is too bent at release. Snap your wrist forward more aggressively - this creates the backspin for better accuracy.`);
                    } else if (userAngles.wrist < benchAngles.wrist - 5) {
                        eventIssues.push(`🎯 ${eventNames[i]}: Release with your wrist in a more bent position, then snap forward. This creates the proper shooting motion.`);
                    }
                }
                
                // Elbow position at release
                if (elbowDiff > 15) {
                    if (userAngles.elbow > benchAngles.elbow + 10) {
                        eventIssues.push(`🎯 ${eventNames[i]}: Your elbow is too wide (chicken wing). Keep your elbow closer to your body and aligned with the rim.`);
                    } else if (userAngles.elbow < benchAngles.elbow - 10) {
                        eventIssues.push(`🎯 ${eventNames[i]}: Your elbow is too tucked in. Find the balance - not too wide, not too tight.`);
                    }
                }
            } else if (eventNames[i] === "Ball Set") {
                // Shooting pocket position
                if (elbowDiff > 15) {
                    if (userAngles.elbow > benchAngles.elbow + 10) {
                        eventIssues.push(`🏀 ${eventNames[i]}: Your elbow is flaring out. Keep your shooting arm aligned - elbow should point toward the rim, not outward.`);
                    } else {
                        eventIssues.push(`🏀 ${eventNames[i]}: Tuck your elbow in slightly more. Your shooting arm should form a smooth L-shape.`);
                    }
                }
                
                // Wrist preparation
                if (userAngles.wrist !== null && benchAngles.wrist !== null && wristDiff > 15) {
                    eventIssues.push(`🏀 ${eventNames[i]}: Prepare your wrist for the shot. Your wrist should be cocked back and ready to snap forward.`);
                }
            } else if (eventNames[i] === "Start") {
                // Initial setup
                if (elbowDiff > 15) {
                    if (userAngles.elbow > benchAngles.elbow + 10) {
                        eventIssues.push(`🏀 ${eventNames[i]}: Start with your elbow closer to your body. Your shooting arm should be relaxed but ready.`);
                    } else {
                        eventIssues.push(`🏀 ${eventNames[i]}: Start with your elbow slightly more bent. Prepare your shooting pocket early.`);
                    }
                }
                
                // Overall form check
                if (armDiff > 15 && userAngles.arm !== null) {
                    eventIssues.push(`🏀 ${eventNames[i]}: Check your shooting stance. Your shooting arm should be aligned with your target from the start.`);
                }
            }
        }
    }
    
    feedback.push(...eventIssues.slice(0, 5)); // Show top 5 issues
    
    // 4. Identify worst phase
    if (userCloseness.length > 0) {
        const minClosenessIdx = userCloseness.indexOf(Math.min(...userCloseness));
        const minCloseness = userCloseness[minClosenessIdx];
        if (minCloseness < 70) {
            const phaseRatio = minClosenessIdx / userCloseness.length;
            let phaseName;
            if (phaseRatio < 0.33) {
                phaseName = "Start/Ball Set";
            } else if (phaseRatio < 0.67) {
                phaseName = "Release";
            } else {
                phaseName = "Follow Through";
            }
            feedback.push(`⚠️ WORST PHASE: ${phaseName} (${minCloseness.toFixed(1)}% match) - Focus on improving this phase.`);
        }
    }
    
    // 5. Consistency check
    if (userCloseness.length > 0) {
        const variance = userCloseness.reduce((acc, val) => {
            const diff = val - avgCloseness;
            return acc + diff * diff;
        }, 0) / userCloseness.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev > 15) {
            feedback.push("⚠️ CONSISTENCY: Your form varies throughout the shot. Focus on maintaining consistent mechanics from start to finish.");
        }
    }
    
    // 6. Wrist snap consistency
    const releaseAngles = getEventAngles(userData, userTimes, 2);
    const followThroughAngles = getEventAngles(userData, userTimes, 3);
    const benchReleaseAngles = getEventAngles(benchmarkData, benchTimes, 2);
    const benchFollowThroughAngles = getEventAngles(benchmarkData, benchTimes, 3);
    
    if (releaseAngles.wrist !== null && followThroughAngles.wrist !== null &&
        benchReleaseAngles.wrist !== null && benchFollowThroughAngles.wrist !== null) {
        const userWristSnap = releaseAngles.wrist - followThroughAngles.wrist;
        const benchWristSnap = benchReleaseAngles.wrist - benchFollowThroughAngles.wrist;
        const snapDiff = userWristSnap - benchWristSnap;
        
        if (snapDiff < -5) {
            feedback.push("💪 WRIST SNAP: You're not snapping your wrist aggressively enough. The snap creates backspin - practice the 'gooseneck' follow-through.");
        } else if (snapDiff > 10) {
            feedback.push("💪 WRIST SNAP: Your wrist snap is too aggressive. Aim for a controlled, smooth snap, not a violent motion.");
        }
    }
    
    // 7. Positive reinforcement
    if (avgCloseness >= 75) {
        const maxCloseness = Math.max(...userCloseness);
        if (maxCloseness > 95) {
            feedback.push("✅ Great job! Some phases match the benchmark perfectly.");
        }
        if (avgCloseness >= 85) {
            feedback.push("💡 TIP: Your form is solid! Focus on repetition to build muscle memory.");
        }
    }
    
    return feedback;
}

function compareShots() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').classList.add('active');
    document.getElementById('step3').style.display = 'block';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    setTimeout(() => {
        const benchForm = extractFormSeries(benchmarkPoseData);
        const userForm = extractFormSeries(userPoseData);
        
        if (benchForm.times.length < 2 || userForm.times.length < 2) {
            document.getElementById('loading').innerHTML = '<p style="color: red;">Insufficient data for comparison. Please record again.</p>';
            return;
        }
        
        const { distance, path } = dtw(benchForm.formVals, userForm.formVals);
        const userCloseness = computeUserCloseness(benchForm.formVals, userForm.formVals, path);
        
        // Generate detailed feedback
        const feedback = generateFeedback(
            benchmarkPoseData,
            userPoseData,
            benchForm.times,
            userForm.times,
            userCloseness
        );
        
        displayResults({
            benchTimes: benchForm.times,
            userTimes: userForm.times,
            userCloseness: userCloseness,
            feedback: feedback
        });
    }, 500);
}

function displayResults(data) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    const avgCloseness = data.userCloseness.reduce((a, b) => a + b, 0) / data.userCloseness.length;
    document.getElementById('overallScore').textContent = `Overall Score: ${avgCloseness.toFixed(1)}%`;
    
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.userTimes.map(t => t.toFixed(2)),
            datasets: [{
                label: 'Benchmark (100%)',
                data: data.benchTimes.map(() => 100),
                borderColor: 'rgb(255, 159, 64)',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0
            }, {
                label: 'Your Shot',
                data: data.userCloseness,
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Shot Form Analysis'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 110,
                    title: {
                        display: true,
                        text: 'Closeness to Benchmark (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    }
                }
            }
        }
    });
    
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = '';
    data.feedback.forEach(feedback => {
        const p = document.createElement('p');
        p.textContent = feedback;
        feedbackList.appendChild(p);
    });
}

// ====================== INITIALIZATION ======================

document.addEventListener('DOMContentLoaded', () => {
    initializePose();
    
    document.getElementById('startBenchmark').addEventListener('click', startBenchmarkRecording);
    document.getElementById('stopBenchmark').addEventListener('click', stopBenchmarkRecording);
    document.getElementById('retakeBenchmark').addEventListener('click', retakeBenchmark);
    
    document.getElementById('startUser').addEventListener('click', startUserRecording);
    document.getElementById('stopUser').addEventListener('click', stopUserRecording);
    document.getElementById('retakeUser').addEventListener('click', retakeUser);
    
    document.getElementById('newComparison').addEventListener('click', resetApp);
});

function retakeBenchmark() {
    benchmarkPoseData = [];
    document.getElementById('retakeBenchmark').style.display = 'none';
    document.getElementById('benchmarkStatus').textContent = '';
    document.getElementById('benchmarkStatus').className = 'status';
}

function retakeUser() {
    userPoseData = [];
    document.getElementById('retakeUser').style.display = 'none';
    document.getElementById('userStatus').textContent = '';
    document.getElementById('userStatus').className = 'status';
}

function resetApp() {
    if (benchmarkCamera) benchmarkCamera.stop();
    if (userCamera) userCamera.stop();
    if (benchmarkStream) benchmarkStream.getTracks().forEach(track => track.stop());
    if (userStream) userStream.getTracks().forEach(track => track.stop());
    
    benchmarkPoseData = [];
    userPoseData = [];
    benchmarkCamera = null;
    userCamera = null;
    benchmarkStream = null;
    userStream = null;
    
    document.getElementById('step1').classList.add('active');
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step3').style.display = 'none';
    
    document.getElementById('startBenchmark').disabled = false;
    document.getElementById('stopBenchmark').disabled = true;
    document.getElementById('startUser').disabled = false;
    document.getElementById('stopUser').disabled = true;
    
    document.getElementById('retakeBenchmark').style.display = 'none';
    document.getElementById('retakeUser').style.display = 'none';
    
    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }
}

