document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(function () {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const show = (el) => el.classList.add("is-visible");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px 60px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
})();

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.is-active").forEach((m) => {
      m.classList.remove("is-active");
    });
    document.body.style.overflow = "";
  }
});

(function () {
  if (reduceMotion) return;
  if (window.matchMedia("(hover: none)").matches) return;

  const cards = document.querySelectorAll(".service-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    let rafId = null;
    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;
    let active = false;

    const render = () => {
      currentRX += (targetRX - currentRX) * 0.12;
      currentRY += (targetRY - currentRY) * 0.12;
      const inner = card.querySelector(".service-card-inner");
      if (inner) {
        inner.style.transform = `perspective(1000px) rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
      }
      if (active || Math.abs(currentRX) > 0.05 || Math.abs(currentRY) > 0.05) {
        rafId = requestAnimationFrame(render);
      } else {
        if (inner) inner.style.transform = "";
        rafId = null;
      }
    };

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRY = (x - 0.5) * 4;
      targetRX = -(y - 0.5) * 3;
      active = true;
      if (!rafId) rafId = requestAnimationFrame(render);
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      targetRX = 0; targetRY = 0; active = false;
      if (!rafId) rafId = requestAnimationFrame(render);
    }, { passive: true });
  });
})();
