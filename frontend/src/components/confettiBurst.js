import confetti from "canvas-confetti";

const ecoColors = ["#12c48b", "#c9f95c", "#7cf6d0", "#0d8f66"];

export function confettiBurst() {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 38,
    colors: ecoColors,
    origin: { y: 0.6 },
    scalar: 0.9,
    zIndex: 9999,
  });
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.7 },
    colors: ecoColors,
    zIndex: 9999,
  });
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.7 },
    colors: ecoColors,
    zIndex: 9999,
  });
}

export function confettiFinale() {
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ecoColors, zIndex: 9999 });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ecoColors, zIndex: 9999 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
