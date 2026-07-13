// Self-contained image carousel. Exposes a global callback,
// window.onCarouselChange(detail), which tracker.js hooks into so slide
// changes become tracked events. No dependencies.
(function () {
  "use strict";
  const root = document.querySelector("[data-track-carousel]");
  if (!root) return;

  const name = root.getAttribute("data-track-carousel");
  const track = root.querySelector(".carousel-track");
  const slides = Array.from(root.querySelectorAll(".slide"));
  const dotsWrap = root.querySelector("[data-carousel-dots]");
  let index = 0;

  // Build one dot per slide.
  const dots = slides.map(function (_, i) {
    const d = document.createElement("button");
    d.className = "carousel-dot";
    d.setAttribute("aria-label", "Go to slide " + (i + 1));
    d.addEventListener("click", function () {
      go(i, "dot");
    });
    dotsWrap.appendChild(d);
    return d;
  });

  function render() {
    track.style.transform = "translateX(" + -index * 100 + "%)";
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === index);
    });
  }

  // Move to slide i. `method` records HOW the change happened
  // (arrow / dot / auto) so tracking can tell deliberate navigation from
  // the automatic timer.
  function go(i, method) {
    const count = slides.length;
    index = ((i % count) + count) % count;
    render();
    if (typeof window.onCarouselChange === "function") {
      window.onCarouselChange({
        carousel: name,
        index: index,
        slide: slides[index].getAttribute("data-slide"),
        method: method,
      });
    }
  }

  root.querySelector("[data-carousel-prev]").addEventListener("click", function () {
    go(index - 1, "arrow-prev");
  });
  root.querySelector("[data-carousel-next]").addEventListener("click", function () {
    go(index + 1, "arrow-next");
  });

  // Auto-advance every 5s; pause on hover.
  let timer = setInterval(function () {
    go(index + 1, "auto");
  }, 5000);
  root.addEventListener("mouseenter", function () {
    clearInterval(timer);
  });
  root.addEventListener("mouseleave", function () {
    timer = setInterval(function () {
      go(index + 1, "auto");
    }, 5000);
  });

  render();
})();
