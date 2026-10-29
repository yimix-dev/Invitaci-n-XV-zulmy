window.onload = function () {
  // ===========================
  // INICIAR DESDE ARRIBA
  // ===========================
  window.scrollTo(0, 0);
  history.scrollRestoration = "manual";

  // ===========================
  // SOBRE DE BIENVENIDA
  // ===========================
  const sello = document.getElementById("sello");
  const sobreContenedor = document.getElementById("sobre"); // Elemento padre

  sello.addEventListener("click", function () {
    const flap = document.getElementById("sobre-flap");
    const overlay = document.getElementById("sobre-overlay");

    // Abre la solapa del sobre
    flap.classList.add("abierto");
    // Añade la clase al contenedor para ocultar el sello y texto suavemente por CSS
    sobreContenedor.classList.add("abierto");

    // Reproduce música
    audio.play();

    // Fade out del overlay (Aumentado a 1.2s para que se alcance a ver el sobre abrirse)
    setTimeout(() => {
      overlay.classList.add("oculto");
    }, 1200);

    // Elimina del DOM
    setTimeout(() => {
      overlay.remove();
    }, 2700);
  });

  // ===========================
  // COUNTDOWN
  // ===========================
  function actualizarContador() {
    const evento = new Date("2026-12-20T15:30:00-06:00");
    const ahora = new Date();
    const diferencia = evento - ahora;

    if (diferencia <= 0) {
      document.getElementById("dias").textContent = "00";
      document.getElementById("horas").textContent = "00";
      document.getElementById("minutos").textContent = "00";
      document.getElementById("segundos").textContent = "00";
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    document.getElementById("dias").textContent = String(dias).padStart(2, "0");
    document.getElementById("horas").textContent = String(horas).padStart(
      2,
      "0"
    );
    document.getElementById("minutos").textContent = String(minutos).padStart(
      2,
      "0"
    );
    document.getElementById("segundos").textContent = String(segundos).padStart(
      2,
      "0"
    );
  }

  setInterval(actualizarContador, 1000);
  actualizarContador();

  // ===========================
  // REPRODUCTOR DE MÚSICA
  // ===========================
  const audio = document.getElementById("audio");

  // ===========================
  // ANIMACIONES AL SCROLL
  // ===========================
  const secciones = document.querySelectorAll("section");

  const observador = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.5 }
  );

  secciones.forEach((seccion) => {
    observador.observe(seccion);
  });

  // ===========================
  // PÉTALOS CAYENDO
  // ===========================
  function crearPetalo() {
    const petalo = document.createElement("div");
    petalo.classList.add("petalo");
    petalo.style.left = Math.random() * 100 + "vw";
    petalo.style.animationDuration = Math.random() * 4 + 5 + "s";
    petalo.style.opacity = "0.7";
    const size = Math.random() * 12 + 10;
    petalo.style.width = size + "px";
    petalo.style.height = size * 1.4 + "px";
    document.body.appendChild(petalo);
    setTimeout(() => petalo.remove(), 9000);
  }

  setInterval(crearPetalo, 800);
};
