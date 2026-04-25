import { FaceDetectorResult, FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

let vision;
let faceDetector;
let lastDetection = null;
let history = [];
let initialized = false;

async function initializeVision() {
    const visionWasmUrl = chrome.runtime.getURL('mediapipe/vision/vision_wasm.js');
    const visionWasmBinaryUrl = chrome.runtime.getURL('mediapipe/vision/vision_wasm.wasm');
    vision = await FilesetResolver.forVision(visionWasmUrl, visionWasmBinaryUrl);
    faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: chrome.runtime.getURL('mediapipe/face_detection_short_range.tflite'),
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
    });
    initialized = true;
}

function smoothDetection(Detection) {
    histoy.push(Detection);
    if (history.length > 5) {
        history.shift();
    }
    const positives = history.filter(Boolean).length;
    return positives >= 3;
}

self.onmessage = async (e) => {
    const { type, imageData } = e.data;
    if (type === 'initialize') {
        await initializeVision();
        self.postMessage({ type: 'initialized' });
    }
    if (type === 'set_opions') {
        minDetectionConfidence = e.data.minDetectionConfidence || 0.5;
        if (faceDetector) {
            faceDetector.setOptions({ minDetectionConfidence });
        }
    }
        if (type === "PROCESS_FRAME") {
        if (!initialized) return;

        const { frame, timestamp } = e.data;

        try {
            const result = faceDetector.detectForVideo(frame, timestamp);

            const rawDetected = result.detections.length > 0;
            const stableDetected = smoothDetection(rawDetected);

            self.postMessage({
                type: "RESULT",
                detected: stableDetected
            });

        } catch (err) {
            self.postMessage({
                type: "ERROR",
                error: err.message
            });
        }
    }
};
