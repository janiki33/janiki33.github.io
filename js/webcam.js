// MediaPipe Tasks-Vision laden
(async function () {
    const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3");
    const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

    let faceLandmarker;
    let webcamRunning = false;

    const video = document.getElementById("webcam");
    const canvasElement = document.getElementById("output_canvas");
    const canvasCtx = canvasElement.getContext("2d");
    const errorElement = document.getElementById("cameraErrorMessage");

    // Fehleranzeige initial verstecken (empfohlen im HTML: style="display:none")
    if (errorElement) {
        errorElement.style.display = "none";
    }

    // FaceLandmarker erstellen
    async function createFaceLandmarker() {
        try {
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });
        } catch (err) {
            console.error("Fehler beim Laden des FaceLandmarker:", err);
            if (errorElement) {
                errorElement.textContent = "Fehler: Face Detection Modell konnte nicht geladen werden.";
                errorElement.style.display = "block";
            }
        }
    }

    await createFaceLandmarker();

    // Webcam starten – mit richtigem Error Handling
    async function startWebcam() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (errorElement) {
                errorElement.textContent = "Fehler: Dein Browser unterstützt keinen Kamerazugriff.";
                errorElement.style.display = "block";
            }
            console.warn("getUserMedia nicht unterstützt");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;

            video.addEventListener("loadedmetadata", () => {
                canvasElement.width = video.videoWidth;
                canvasElement.height = video.videoHeight;
                webcamRunning = true;
                predictWebcam();
            });

            video.addEventListener("error", (e) => {
                console.error("Video-Element Fehler:", e);
                if (errorElement) {
                    errorElement.textContent = "Fehler beim Laden des Kamerastreams.";
                    errorElement.style.display = "block";
                }
            });

        } catch (err) {
            console.error("Kamerazugriff verweigert oder Fehler:", err);

            let message = "Kamerazugriff fehlgeschlagen.";
            if (err.name === "NotAllowedError") {
                message = "Zugriff auf die Kamera wurde verweigert. Bitte erlaube den Kamerazugriff und lade die Seite neu.";
            } else if (err.name === "NotFoundError") {
                message = "Keine Kamera gefunden.";
            } else if (err.name === "NotReadableError") {
                message = "Kamera wird bereits verwendet (z. B. von einer anderen App).";
            }

            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = "block";
            }
        }
    }

    let lastVideoTime = -1;
    async function predictWebcam() {
        if (!webcamRunning) return;

        let startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;

            if (!faceLandmarker) {
                return; // Falls Modell nicht geladen
            }

            const results = await faceLandmarker.detectForVideo(video, startTimeMs);

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];
                const drawingUtils = new DrawingUtils(canvasCtx);

                // Debug-Verbindungen zeichnen
                /*drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030", lineWidth: 1 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30", lineWidth: 1 });
                */

                // Spezielle rote Punkte für Augenwinkel
                /*const specialIndices = [130, 133, 362, 359];
                const radius = 2;

                specialIndices.forEach(index => {
                    if (landmarks[index]) {
                        const { x, y } = landmarks[index];
                        const px = x * canvasElement.width;
                        const py = y * canvasElement.height;

                        canvasCtx.fillStyle = "red";
                        canvasCtx.beginPath();
                        canvasCtx.arc(px, py, radius, 0, 2 * Math.PI);
                        canvasCtx.fill();

                        canvasCtx.strokeStyle = "white";
                        canvasCtx.lineWidth = 2;
                        canvasCtx.stroke();
                    }
                });
                */
            }

            // PNG-Bild laden (ersetze den Pfad durch dein eigenes Bild)
            const overlayImage = new Image();
            overlayImage.src = "images/russian_lash.png";  // z.B. "brille.png" oder eine URL

            // Innerhalb deiner predictWebcam()-Funktion, wo du die landmarks hast:

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];

                // Linker Ankerpunkt: Mitte der linken Bildseite → Landmark 33
                // Rechter Ankerpunkt: Mitte der rechten Bildseite → Landmark 263
                const leftIdx = 362;  // äußerer Augenwinkel rechts (aus Kamerasicht links)
                const rightIdx = 359; // äußerer Augenwinkel links (aus Kamerasicht rechts)
                const thirdIdx = 386;   // Dritter Punkt für Höhenposition (z. B. 10 = Stirn, 152 = Kinn, 1 = Nasenspitze)

                if (landmarks[leftIdx] && landmarks[rightIdx] && landmarks[thirdIdx] &&
                    overlayImage.complete && overlayImage.naturalWidth > 0) {

                    const pLeft = landmarks[leftIdx];
                    const pRight = landmarks[rightIdx];
                    const pThird = landmarks[thirdIdx];

                    const xLeft = pLeft.x * canvasElement.width;
                    const yLeft = pLeft.y * canvasElement.height;
                    const xRight = pRight.x * canvasElement.width;
                    const yRight = pRight.y * canvasElement.height;
                    const xThird = pThird.x * canvasElement.width;
                    const yThird = pThird.y * canvasElement.height;

                    // Mittelpunkt der Basislinie (Augen)
                    const centerX = (xLeft + xRight) / 2;
                    const centerY = (yLeft + yRight) / 2;

                    // Abstand Augen → Skalierung (unverändert)
                    const distance = Math.hypot(xRight - xLeft, yRight - yLeft);
                    const originalWidth = overlayImage.naturalWidth;
                    const scale = distance / originalWidth;

                    // Rotationswinkel der Augenlinie
                    const angleRad = Math.atan2(yRight - yLeft, xRight - xLeft);

                    // Richtung senkrecht zur Augenlinie (90° gedreht)
                    const perpAngle = angleRad + Math.PI / 2;  // Rechtwinklig
                    const perpDirX = Math.cos(perpAngle);
                    const perpDirY = Math.sin(perpAngle);

                    // Abstand des dritten Punktes vom Mittelpunkt (projiziert senkrecht)
                    const dx = xThird - centerX;
                    const dy = yThird - centerY;
                    const offsetDistance = dx * perpDirX + dy * perpDirY;  // Vorzeichen behalten für Richtung

                    // Offset in Pixeln (anpassen mit Faktor für Feinabstimmung)
                    const offsetFactor = 0.9;  // z. B. 0.8 für weniger Verschiebung, 1.2 für mehr
                    const offsetX = perpDirX * offsetDistance * offsetFactor;
                    const offsetY = perpDirY * offsetDistance * offsetFactor;

                    // Finale Position: Mittelpunkt + senkrechter Offset
                    const finalX = centerX + offsetX;
                    const finalY = centerY + offsetY;

                    canvasCtx.save();

                    canvasCtx.translate(finalX, finalY);
                    canvasCtx.rotate(angleRad);
                    canvasCtx.scale(scale, scale);

                    const imgW = originalWidth;
                    const imgH = overlayImage.naturalHeight;

                    canvasCtx.drawImage(
                        overlayImage,
                        -imgW / 2,
                        -imgH / 2
                    );

                    canvasCtx.restore();
                }
            }

            // flip version for lashes

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];

                const leftIdx = 130;   // Mitte der linken Bildseite
                const rightIdx = 133;  // Mitte der rechten Bildseite
                const thirdIdx = 159;   // Dritter Punkt für Höhenposition (z. B. 10 = Stirn, 152 = Kinn, 1 = Nasenspitze)

                if (landmarks[leftIdx] && landmarks[rightIdx] && landmarks[thirdIdx] &&
                    overlayImage.complete && overlayImage.naturalWidth > 0) {

                    const pLeft = landmarks[leftIdx];
                    const pRight = landmarks[rightIdx];
                    const pThird = landmarks[thirdIdx];

                    const xLeft = pLeft.x * canvasElement.width;
                    const yLeft = pLeft.y * canvasElement.height;
                    const xRight = pRight.x * canvasElement.width;
                    const yRight = pRight.y * canvasElement.height;
                    const xThird = pThird.x * canvasElement.width;
                    const yThird = pThird.y * canvasElement.height;

                    // Mittelpunkt der Basislinie (Augen)
                    const centerX = (xLeft + xRight) / 2;
                    const centerY = (yLeft + yRight) / 2;

                    // Abstand Augen → Skalierung (unverändert)
                    const distance = Math.hypot(xRight - xLeft, yRight - yLeft);
                    const originalWidth = overlayImage.naturalWidth;
                    const scale = distance / originalWidth;

                    // Rotationswinkel der Augenlinie
                    const angleRad = Math.atan2(yRight - yLeft, xRight - xLeft);

                    // Richtung senkrecht zur Augenlinie (90° gedreht)
                    const perpAngle = angleRad + Math.PI / 2;  // Rechtwinklig
                    const perpDirX = Math.cos(perpAngle);
                    const perpDirY = Math.sin(perpAngle);

                    // Abstand des dritten Punktes vom Mittelpunkt (projiziert senkrecht)
                    const dx = xThird - centerX;
                    const dy = yThird - centerY;
                    const offsetDistance = dx * perpDirX + dy * perpDirY;  // Vorzeichen behalten für Richtung

                    // Offset in Pixeln (anpassen mit Faktor für Feinabstimmung)
                    const offsetFactor = 0.9;  // z. B. 0.8 für weniger Verschiebung, 1.2 für mehr
                    const offsetX = perpDirX * offsetDistance * offsetFactor;
                    const offsetY = perpDirY * offsetDistance * offsetFactor;

                    // Finale Position: Mittelpunkt + senkrechter Offset
                    const finalX = centerX + offsetX;
                    const finalY = centerY + offsetY;

                    canvasCtx.save();

                    canvasCtx.translate(finalX, finalY);
                    canvasCtx.rotate(angleRad);
                    canvasCtx.scale(scale, scale);

                    // Horizontal flippen
                    canvasCtx.scale(-1, 1);

                    const imgW = originalWidth;
                    const imgH = overlayImage.naturalHeight;

                    canvasCtx.drawImage(
                        overlayImage,
                        -imgW / 2,
                        -imgH / 2
                    );

                    canvasCtx.restore();
                }
            }

            canvasCtx.restore();
        }

        if (webcamRunning) {
            window.requestAnimationFrame(predictWebcam);
        }
    }

    // Starte die Webcam
    await startWebcam();

})();
