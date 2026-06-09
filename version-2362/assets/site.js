const menuButton = document.querySelector(".menu-toggle");
const mobilePanel = document.querySelector("#mobile-panel");

if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
        const isOpen = mobilePanel.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });
}

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
    if (!heroSlides.length) {
        return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === heroIndex);
    });

    heroDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
}

function startHeroTimer() {
    if (heroSlides.length <= 1) {
        return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => {
        showHeroSlide(heroIndex + 1);
    }, 5200);
}

heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
        const nextIndex = Number(dot.dataset.heroDot || 0);
        showHeroSlide(nextIndex);
        startHeroTimer();
    });
});

startHeroTimer();

document.addEventListener("error", (event) => {
    const target = event.target;

    if (target instanceof HTMLImageElement) {
        target.classList.add("image-missing");
    }
}, true);
