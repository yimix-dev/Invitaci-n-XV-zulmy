(() => {
  "use strict";

  const audio = document.getElementById("audio");
  const canvas = document.getElementById("ondaCanvas");
  const ctx = canvas.getContext("2d");
  const btnStop = document.getElementById("btnStop");

  let audioCtx;
  let analyser;
  let sourceNode;
  let dataArray;
  let bufferLength;
  let rafId = null;
  let graphReady = false;

  const COLOR_GOLD = "#C9A24B";
  const COLOR_GOLD_DEEP = "#A67C3D";
  const COLOR_ROSE = "#E8A0B4";

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function ensureAudioGraph() {
    if (graphReady) {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return;
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    sourceNode = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    graphReady = true;
  }

  function roundedBar(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  function drawBars() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    analyser.getByteFrequencyData(dataArray);

    const halfBars = 32;
    const usableBins = Math.floor(bufferLength * 0.75);
    const step = Math.max(1, Math.floor(usableBins / halfBars));

    const barWidth = w / 2 / halfBars;
    const midX = w / 2;
    const midY = h / 2;

    const gradient = ctx.createLinearGradient(
      0,
      midY - h * 0.45,
      0,
      midY + h * 0.45
    );

    gradient.addColorStop(0, COLOR_ROSE);
    gradient.addColorStop(0.5, COLOR_GOLD);
    gradient.addColorStop(1, COLOR_GOLD_DEEP);

    ctx.fillStyle = gradient;

    for (let i = 0; i < halfBars; i++) {
      const value = dataArray[i * step] / 255;
      const barHeight = Math.max(2, value * (h * 0.45));

      const bw = barWidth * 0.56;
      const r = Math.min(bw / 2, 3);

      const xRight = midX + i * barWidth;
      const xLeft = midX - i * barWidth - bw;

      roundedBar(xRight, midY - barHeight, bw, barHeight * 2, r);

      roundedBar(xLeft, midY - barHeight, bw, barHeight * 2, r);
    }
  }

  function drawIdleLine() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(201, 162, 75, 0.35)";
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

  function startWaves() {
    ensureAudioGraph();

    if (!rafId) {
      loop();
    }
  }

  function stopWaves() {
    if (rafId) {
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

  btnStop.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch((error) => {
        console.error("No se pudo reproducir el audio:", error);
      });
    } else {
      audio.pause();
    }
  });

  drawIdleLine();
})();
