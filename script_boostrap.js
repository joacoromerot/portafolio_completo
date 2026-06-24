// =========================================================
// ANIMACIONES: scroll reveal, contador del marcador y
// barra de progreso tipo "reloj de juego"
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

  // ---------- 1) SCROLL REVEAL ----------
  // Las tarjetas y títulos aparecen con un fade + slide al entrar en pantalla
  const elementosReveal = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('is-visible');
        observer.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elementosReveal.forEach((el) => observer.observe(el));

  // Animación escalonada para las tarjetas de club (que entren una tras otra)
  const tarjetas = document.querySelectorAll('#mi-carrera .card-club');
  tarjetas.forEach((tarjeta, i) => {
    tarjeta.style.transitionDelay = (i * 0.12) + 's';
  });


  // ---------- 2) CONTADOR ANIMADO DEL MARCADOR ----------
  const numeros = document.querySelectorAll('.score-num');

  function animarNumero(elemento) {
    const destino = parseInt(elemento.getAttribute('data-target'), 10);
    const duracion = 1200;
    const inicio = performance.now();

    function paso(ahora) {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const valorActual = Math.floor(progreso * destino);
      elemento.textContent = valorActual;
      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        elemento.textContent = destino;
      }
    }
    requestAnimationFrame(paso);
  }

  const scoreboardObserver = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        numeros.forEach(animarNumero);
        scoreboardObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const scoreboard = document.querySelector('.scoreboard');
  if (scoreboard) {
    scoreboardObserver.observe(scoreboard);
  }


});