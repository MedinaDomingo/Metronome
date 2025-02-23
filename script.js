document.addEventListener('DOMContentLoaded', function () {
    const bpmDisplay = document.querySelector('.bpm');
    const bpmSlider = document.getElementById('bpm-slider');
    const startStopButton = document.getElementById('start-stop');
    const timeSignatureSelect = document.getElementById('time-signature');
    const beatsContainer = document.querySelector('.beats');

    let bpm = 120;
    let isRunning = false;
    let audioContext;
    let timeSignature = 4; // Compás por defecto (4/4)
    let currentBeat = 0;
    let nextBeatTime = 0;
    let animationFrameId;

    // Frecuencias objetivo de las cuerdas del violín (G, D, A, E)
    const violinStrings = {
        G: 196.00,
        D: 293.66,
        A: 440.00,
        E: 659.25
    };

    // Crear el contexto de audio y los osciladores
    function createAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Función para generar un sonido
    function playSound(frequency = 800, duration = 0.05) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
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

    // Función principal del metrónomo
    function metronomeLoop(timestamp) {
        if (!isRunning) return;

        if (timestamp >= nextBeatTime) {
            const allBeats = document.querySelectorAll('.beat');
            allBeats.forEach(beat => beat.classList.remove('active'));

            // Activar el beat actual
            allBeats[currentBeat].classList.add('active');

            // Reproducir sonido
            if (currentBeat === 0) {
                playSound(violinStrings.G, 0.1); // Sonido grave para el primer beat
            } else {
                playSound(violinStrings.E, 0.05); // Sonido agudo para los demás beats
            }

            // Avanzar al siguiente beat
            currentBeat = (currentBeat + 1) % timeSignature;

            // Calcular el tiempo del próximo beat
            nextBeatTime = timestamp + (60000 / bpm);
        }

        // Solicitar el siguiente frame
        animationFrameId = requestAnimationFrame(metronomeLoop);
    }

    // Actualizar BPM
    bpmSlider.addEventListener('input', function () {
        bpm = parseInt(this.value);
        bpmDisplay.textContent = bpm;
    });

    // Cambiar el compás
    timeSignatureSelect.addEventListener('change', function () {
        timeSignature = parseInt(this.value);
        updateBeats();
    });

    // Iniciar/Detener el metrónomo
    startStopButton.addEventListener('click', function () {
        if (isRunning) {
            cancelAnimationFrame(animationFrameId);
            isRunning = false;
            startStopButton.textContent = 'Start';
            document.querySelectorAll('.beat').forEach(beat => beat.classList.remove('active'));
        } else {
            createAudioContext(); // Asegurarse de que el contexto de audio esté creado
            nextBeatTime = performance.now(); // Reiniciar el tiempo del próximo beat
            currentBeat = 0; // Reiniciar el beat actual
            isRunning = true;
            startStopButton.textContent = 'Stop';
            metronomeLoop(nextBeatTime); // Iniciar el bucle del metrónomo
        }
    });

    // Inicializar los beats
    updateBeats();
});
