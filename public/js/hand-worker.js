/* Runs MediaPipe hand tracking off the main thread so the 3D room keeps its frame rate. */
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
let rec = null;
const cats = a => (a || []).map(list => list.map(c => ({categoryName: c.categoryName, score: c.score})));
self.onmessage = async e => {
  const m = e.data;
  if (m.type === 'init') {
    try {
      importScripts(MP + '/vision_bundle.js');
      const V = self.Vision || self;
      const fs = await V.FilesetResolver.forVisionTasks(MP + '/wasm');
      const opts = d => ({baseOptions: {modelAssetPath: MODEL, delegate: d}, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: 0.6, minTrackingConfidence: 0.5});
      try { rec = await V.GestureRecognizer.createFromOptions(fs, opts('GPU')); } catch (gpuErr) { rec = await V.GestureRecognizer.createFromOptions(fs, opts('CPU')); }
      self.postMessage({type: 'ready'});
    } catch (err) { self.postMessage({type: 'error', message: String(err && err.message || err)}); }
  } else if (m.type === 'frame') {
    let res = null;
    try { res = rec.recognizeForVideo(m.bitmap, m.ts); } catch (err) { /* skip frame */ }
    m.bitmap.close();
    self.postMessage({type: 'result', ts: m.ts, res: res ? {landmarks: res.landmarks || [], gestures: cats(res.gestures), handedness: cats(res.handedness)} : {landmarks: [], gestures: [], handedness: []}});
  }
};
