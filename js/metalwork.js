// ---------- PAGE LOADER ----------
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.transition = "opacity 0.8s ease";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 800);
  }
});

// ---------- NAVBAR TOGGLE ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isActive = navLinks.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isActive ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- ACCORDION HELPERS ----------
function closeAccordionSection(toggle, panel) {
  if (!toggle || !panel) return;
  toggle.setAttribute("aria-expanded", "false");
  panel.classList.remove("open");
}

function openAccordionSection(toggle, panel) {
  if (!toggle || !panel) return;
  toggle.setAttribute("aria-expanded", "true");
  panel.classList.add("open");
}

// ---------- SMOOTH SCROLL FOR HASH LINKS ----------
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    const relatedToggle = target.querySelector(".accordion-toggle");
    const relatedPanel = relatedToggle ? relatedToggle.nextElementSibling : null;

    if (relatedToggle && relatedPanel) {
      document.querySelectorAll(".accordion-section").forEach((section) => {
        const toggle = section.querySelector(".accordion-toggle");
        const panel = section.querySelector(".accordion-panel");
        if (toggle !== relatedToggle) {
          closeAccordionSection(toggle, panel);
        }
      });
      openAccordionSection(relatedToggle, relatedPanel);
    }

    e.preventDefault();
    setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  });
});

// ---------- ACCORDION SECTIONS ----------
const accordionSections = document.querySelectorAll(".accordion-section");
const accordionToggles = document.querySelectorAll(".accordion-toggle");

accordionToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const panel = toggle.nextElementSibling;
    const isOpen = panel.classList.contains("open");

    accordionSections.forEach((section) => {
      const otherToggle = section.querySelector(".accordion-toggle");
      const otherPanel = section.querySelector(".accordion-panel");
      if (otherToggle !== toggle) {
        closeAccordionSection(otherToggle, otherPanel);
      }
    });

    if (isOpen) {
      closeAccordionSection(toggle, panel);
    } else {
      openAccordionSection(toggle, panel);
    }
  });
});

// ---------- GALLERY MODAL ----------
const thumbs = document.querySelectorAll(".thumb");
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const galleryCloseBtn = document.getElementById("close-modal");

if (thumbs.length && modal && modalImg && modalTitle && modalDesc && galleryCloseBtn) {
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = thumb.dataset.img || "";
      modalTitle.textContent = thumb.dataset.title || "";
      modalDesc.innerHTML = thumb.dataset.description || "";
      document.body.style.overflow = "hidden";
    });
  });

  galleryCloseBtn.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
}

// ---------- HERO SLIDESHOW ----------
const heroImage = document.getElementById("heroImage");

if (heroImage) {
  const heroImages = [
    "images/hero1.jpg",
    "images/hero2.png",
    "images/hero4.jpg",
    "images/hero5.png",
    "images/hero6.jpg",
    "images/hero7.jpg",
    "images/hero8.jpg",
    "images/hero9.png",
    "images/hero10.png",
    "images/hero11.png",
  ];

  let currentIndex = 0;
  const displayDuration = 4000;
  const transitionDuration = 1000;

  function transitionToNext() {
    heroImage.style.transition = `opacity ${transitionDuration}ms ease, transform ${transitionDuration}ms ease`;
    heroImage.style.opacity = 0;
    heroImage.style.transform = "translate(-50%, -50%) scale(0.1)";

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % heroImages.length;
      const nextImage = new Image();
      nextImage.src = heroImages[currentIndex];

      nextImage.onload = () => {
        heroImage.src = nextImage.src;
        void heroImage.offsetWidth;
        heroImage.style.transition = `opacity ${transitionDuration}ms ease, transform ${transitionDuration}ms ease`;
        heroImage.style.opacity = 1;
        heroImage.style.transform = "translate(-50%, -50%) scale(1)";
      };
    }, transitionDuration);
  }

  const preload = new Image();
  preload.src = heroImages[0];
  preload.onload = () => {
    heroImage.src = preload.src;
    heroImage.style.opacity = 0;
    heroImage.style.transform = "translate(-50%, -50%) scale(0.1)";

    requestAnimationFrame(() => {
      heroImage.style.transition = `opacity ${transitionDuration}ms ease, transform ${transitionDuration}ms ease`;
      heroImage.style.opacity = 1;
      heroImage.style.transform = "translate(-50%, -50%) scale(1)";
    });

    setInterval(transitionToNext, displayDuration + transitionDuration);
  };
}

// ---------- FORMSPREE THANK YOU MODAL ----------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const thankYouModal = document.getElementById("thankYouModal");
  const thankYouCloseBtn = document.getElementById("closeThankYou");

  if (!form || !thankYouModal || !thankYouCloseBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        thankYouModal.style.display = "flex";
        form.reset();
        document.body.style.overflow = "hidden";
      } else {
        alert("Oops! Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Oops! Something went wrong. Please try again.");
    }
  });

  thankYouCloseBtn.addEventListener("click", () => {
    thankYouModal.style.display = "none";
    document.body.style.overflow = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === thankYouModal) {
      thankYouModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
});