
(() => {
  "use strict";

  function iniciarVisualizador() {
    const audio = document.getElementById("audio");
    const canvas = document.getElementById("ondaCanvas");
    const btnStop = document.getElementById("btnStop");

    if (!audio || !canvas || !btnStop) {
      console.error("No se encontraron los elementos del reproductor.");
      return;
    }

    const ctx = canvas.getContext("2d");

    // Evitar inicializaciones duplicadas
    if (canvas.dataset.visualizadorActivo === "true") return;
    canvas.dataset.visualizadorActivo = "true";

    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let dataArray = null;
    let bufferLength = 0;
    let rafId = null;

    // PALETA AZUL
    const COLOR_BLUE_LIGHT = "#9DA2B0";
    const COLOR_BLUE = "#2A4178";
    const COLOR_BLUE_DEEP = "#13275B";

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (rafId === null) {
        drawIdleLine();
      }
    }

    window.addEventListener("resize", resizeCanvas);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(resizeCanvas);
      observer.observe(canvas);
    }

    function ensureAudioGraph() {
      if (audioCtx) return;

      audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;

      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      sourceNode = audioCtx.createMediaElementSource(audio);

      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    function roundedBar(x, y, w, h, r) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    }

    function drawBars() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (w === 0 || h === 0 || !analyser) return;

      ctx.clearRect(0, 0, w, h);

      analyser.getByteFrequencyData(dataArray);

      const halfBars = 32;
      const usableBins = Math.floor(bufferLength * 0.75);
      const step = Math.max(1, Math.floor(usableBins / halfBars));

      const barWidth = w / (halfBars * 2);
      const midX = w / 2;
      const midY = h / 2;

      // DEGRADADO AZUL
      const gradient = ctx.createLinearGradient(
        0,
        midY - h * 0.45,
        0,
        midY + h * 0.45
      );

      gradient.addColorStop(0, COLOR_BLUE_LIGHT);
      gradient.addColorStop(0.5, COLOR_BLUE);
      gradient.addColorStop(1, COLOR_BLUE_DEEP);

      ctx.fillStyle = gradient;

      for (let i = 0; i < halfBars; i++) {
        const index = Math.min(i * step, bufferLength - 1);

        const value = dataArray[index] / 255;

        // Mejora la visibilidad de frecuencias suaves
        const intensity = Math.pow(value, 0.7);

        const barHeight = Math.max(
          2,
          intensity * (h * 0.45)
        );

        const bw = barWidth * 0.56;
        const r = Math.min(bw / 2, 3);

        const xRight = midX + i * barWidth;
        const xLeft = midX - i * barWidth - bw;

        roundedBar(
          xRight,
          midY - barHeight,
          bw,
          barHeight * 2,
          r
        );

        roundedBar(
          xLeft,
          midY - barHeight,
          bw,
          barHeight * 2,
          r
        );
      }
    }

    function drawIdleLine() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(42, 65, 120, 0.65)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }

    function loop() {
      drawBars();
      rafId = requestAnimationFrame(loop);
    }

    async function startWaves() {
      try {
        ensureAudioGraph();

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        if (audio.paused) return;

        if (rafId === null) {
          loop();
        }

      } catch (error) {
        console.error("Error en el espectro de audio:", error);
      }
    }

    function stopWaves() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      drawIdleLine();
    }

    audio.addEventListener("play", () => {
      startWaves();
      btnStop.textContent = "Pausar música";
    });

    audio.addEventListener("pause", () => {
      stopWaves();
      btnStop.textContent = "Reproducir música";
    });

    audio.addEventListener("ended", () => {
      stopWaves();
      btnStop.textContent = "Reproducir música";
    });

    btnStop.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          ensureAudioGraph();

          if (audioCtx.state === "suspended") {
            await audioCtx.resume();
          }

          await audio.play();
          startWaves();

        } catch (error) {
          console.error("No se pudo reproducir:", error);
        }
      } else {
        audio.pause();
      }
    });

    resizeCanvas();

    // Detectar audio que ya esté reproduciéndose
    if (!audio.paused) {
      startWaves();
      btnStop.textContent = "Pausar música";
    } else {
      drawIdleLine();
      btnStop.textContent = "Reproducir música";
    }
  }

  // Inicializar después de cargar el HTML
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciarVisualizador,
      { once: true }
    );
  } else {
    iniciarVisualizador();
  }
})();
