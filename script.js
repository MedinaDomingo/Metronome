document.addEventListener('DOMContentLoaded', function () {
    const bpmDisplay = document.querySelector('.bpm');
    const bpmSlider = document.getElementById('bpm-slider');
    const startStopButton = document.getElementById('start-stop');
    const timeSignatureSelect = document.getElementById('time-signature');
    const beatsContainer = document.querySelector('.beats');

    let bpm = 120;
    let isRunning = false;
    let interval;
    let audioContext;
    let timeSignature = 4; // Compás por defecto (4/4)

    // Función para generar un sonido
    function playSound(frequency = 800, duration = 0.05) {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // Frecuencia del sonido
        gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Volumen

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration); // Duración del sonido
    }

    // Función para actualizar los beats según el compás
    function updateBeats() {
        beatsContainer.innerHTML = ''; // Limpiar los beats anteriores
        for (let i = 0; i < timeSignature; i++) {
            const beat = document.createElement('div');
            beat.classList.add('beat');
            if (i === 0) beat.classList.add('first-beat'); // Marcar el primer beat
            beatsContainer.appendChild(beat);
        }
    }

    // Actualizar BPM
    bpmSlider.addEventListener('input', function () {
        bpm = parseInt(this.value);
        bpmDisplay.textContent = bpm;
        if (isRunning) {
            clearInterval(interval);
            interval = setInterval(playBeat, 60000 / bpm);
        }
    });

    // Cambiar el compás
    timeSignatureSelect.addEventListener('change', function () {
        timeSignature = parseInt(this.value);
        updateBeats();
        if (isRunning) {
            clearInterval(interval);
            interval = setInterval(playBeat, 60000 / bpm);
        }
    });

    // Iniciar/Detener el metrónomo
    startStopButton.addEventListener('click', function () {
        if (isRunning) {
            clearInterval(interval);
            isRunning = false;
            startStopButton.textContent = 'Start';
            document.querySelectorAll('.beat').forEach(beat => beat.classList.remove('active'));
        } else {
            interval = setInterval(playBeat, 60000 / bpm);
            isRunning = true;
            startStopButton.textContent = 'Stop';
        }
    });

    let currentBeat = 0;

    // Función para reproducir el beat
    function playBeat() {
        const allBeats = document.querySelectorAll('.beat');
        allBeats.forEach(beat => beat.classList.remove('active'));

        // Activar el beat actual
        allBeats[currentBeat].classList.add('active');

        // Reproducir sonido
        if (currentBeat === 0) {
            playSound(400, 0.1); // Sonido grave para el primer beat
        } else {
            playSound(800, 0.05); // Sonido agudo para los demás beats
        }

        // Avanzar al siguiente beat
        currentBeat = (currentBeat + 1) % timeSignature;
    }

    // Inicializar los beats
    updateBeats();
});