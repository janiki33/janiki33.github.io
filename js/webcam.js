document.addEventListener("DOMContentLoaded", () => {
    startWebcam();
});

async function startWebcam() {
    const videoElement = document.getElementById('webcamVideo');
    const errorElement = document.getElementById('cameraErrorMessage');

    // Konfiguration: Wir wollen Video, bevorzugt die Front-Kamera ("user")
    const constraints = {
        audio: false, // Kein Ton nötig für Anprobe
        video: {
            facingMode: 'user', // 'user' = Frontkamera, 'environment' = Rückkamera
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    try {
        // Zugriff auf die Kamera anfordern
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Stream an das Video-Element binden
        videoElement.srcObject = stream;
        
    } catch (err) {
        console.error("Fehler beim Zugriff auf die Webcam:", err);
        // Fehlermeldung anzeigen, falls Nutzer ablehnt oder keine Kamera hat
        if (errorElement) {
            errorElement.style.display = 'block';
            videoElement.style.display = 'none';
        }
    }
}