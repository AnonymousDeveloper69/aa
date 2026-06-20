document.getElementById("year").textContent = new Date().getFullYear();

const canvas = document.getElementById('interactive-canvas');
const ctx = canvas.getContext('2d');
let sparks = [];
let isScrolling = false;
let scrollTimeout;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
  canvas.remove();
}

function resizeCanvas() {
  if (canvas.parentNode) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

window.addEventListener('scroll', () => {
  isScrolling = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
}, { passive: true });

class Spark {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 1.6 - 0.8;
    this.speedY = Math.random() * -1.5 - 0.3;
    this.hue = Math.floor(Math.random() * 360);
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.02;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
  }
  draw() {
    ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.life})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let lastMove = 0;
window.addEventListener('mousemove', (e) => {
  if (isScrolling || reduceMotion) return; 
  const now = performance.now();
  if (now - lastMove < 24) return; 
  lastMove = now;
  
  if (sparks.length < 40) {
    sparks.push(new Spark(e.clientX, e.clientY));
  }
}, { passive: true });

function animateSparks() {
  if (reduceMotion) return;
  if (!isScrolling && sparks.length > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < sparks.length; i++) {
      sparks[i].update();
      sparks[i].draw();
      if (sparks[i].life <= 0) {
        sparks.splice(i, 1);
        i--;
      }
    }
  } else if (sparks.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(animateSparks);
}
requestAnimationFrame(animateSparks);

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
    { threshold: 0.05, rootMargin: "0px 0px 40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
})();
