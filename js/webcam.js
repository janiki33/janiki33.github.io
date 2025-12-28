let faceMesh;
let faces = [];
let video;
let canvas;
let lashesImg; // Bild der Wimpern

function preload() {
    // FaceMesh initialisieren
    faceMesh = ml5.faceMesh({
        maxFaces: 1,
        flipped: true,
        detectionConfidence: 0.5
    });

    // Lashes-Bild laden
    lashesImg = loadImage('images/lashes.png');
}

function setup() {
    const container = document.getElementById('webcamVideo');
    const w = container.clientWidth;
    const h = container.clientHeight;

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('webcamVideo');

    const constraints = {
        video: { facingMode: 'user', width: { ideal: w }, height: { ideal: h } },
        audio: false
    };

    video = createCapture(constraints);
    video.size(w, h);
    video.hide();

    faceMesh.detectStart(video, gotFaces);
}

function windowResized() {
    const container = document.getElementById('webcamVideo');
    const w = container.clientWidth;
    const h = container.clientHeight;
    resizeCanvas(w, h);
}

function gotFaces(results) {
    faces = results;
}

function draw() {
    background(0);

    if (video.width === 0 || video.height === 0) return;

    // Berechne Skalierung, damit das Video nicht verzerrt wird
    let scaleFactor = max(width / video.width, height / video.height);
    let videoW = video.width * scaleFactor;
    let videoH = video.height * scaleFactor;
    let x = (width - videoW) / 2;
    let y = (height - videoH) / 2;

    // Video spiegeln
    push();
    image(video, x, y, videoW, videoH);
    pop();

    if (faces.length > 0) {
        let face = faces[0];
        // Punkt 386 (z.B. Oberlid oder Wimperbereich)
        let keypoint = face.keypoints[386];
        let px = keypoint.x * scaleFactor + x;
        let py = keypoint.y * scaleFactor + y;

        // Lashes zentriert auf den Punkt setzen
        let imgW = 100; // Breite der Lashes
        let imgH = 50;  // Höhe der Lashes
        image(lashesImg, width - px - imgW / 2, py - imgH / 2, imgW, imgH);
    }

    // FaceMesh-Punkte proportional zum Video skalieren
    if (faces.length > 0) {
        let face = faces[0];
        for (let i = 0; i < face.keypoints.length; i++) {
            let keypoint = face.keypoints[i];
            //Punkte skalieren und verschieben
            let px = keypoint.x * scaleFactor + x;
            let py = keypoint.y * scaleFactor + y;

            fill(255, 255, 0);
            noStroke();
            circle(width - px, py, 2); // width - px wegen Spiegelung
        }
    }
}
