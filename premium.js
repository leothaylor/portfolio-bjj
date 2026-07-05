const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
revealItems.forEach((item) => observer.observe(item));
