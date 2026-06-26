document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a");
  const forms = document.querySelectorAll("[data-formspree-form]");
  const yearEl = document.getElementById("year");

  const popup = document.getElementById("form-popup");
  const popupClose = document.getElementById("popup-close");
  const popupButton = document.getElementById("popup-button");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInsideNav = siteNav.contains(event.target);
      const clickedToggle = navToggle.contains(event.target);

      if (!clickedInsideNav && !clickedToggle) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        closePopup();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function openPopup() {
    if (!popup) return;
    popup.classList.add("active");
    popup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove("active");
    popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (popupClose) {
    popupClose.addEventListener("click", closePopup);
  }

  if (popupButton) {
    popupButton.addEventListener("click", closePopup);
  }

  if (popup) {
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });
  }

  forms.forEach((form) => {
    const status = form.parentElement.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    const loadTimeInput = form.querySelector("[data-form-load-time]");

    if (loadTimeInput) {
      loadTimeInput.value = Date.now();
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const honeypot = form.querySelector('input[name="_gotcha"]');

      if (honeypot && honeypot.value.trim() !== "") {
        return;
      }

      if (loadTimeInput) {
        const timeTaken = Date.now() - Number(loadTimeInput.value);

        if (timeTaken < 4000) {
          return;
        }
      }

      if (status) {
        status.textContent = "Sending...";
        status.classList.remove("is-error", "is-success");
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          form.reset();

          if (status) {
            status.textContent =
              form.dataset.successMessage || "Thank you. Your form has been sent.";
            status.classList.add("is-success");
          }

          openPopup();
        } else {
          if (status) {
            status.textContent =
              "Sorry, there was a problem sending your form. Please try again.";
            status.classList.add("is-error");
          }
        }
      } catch (error) {
        if (status) {
          status.textContent =
            "Sorry, there was a connection problem. Please try again.";
          status.classList.add("is-error");
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = form.dataset.buttonText || "Send";
        }

        if (loadTimeInput) {
          loadTimeInput.value = Date.now();
        }
      }
    });
  });
});

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");

  if (!question) return;

  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((otherItem) => {
      const otherQuestion = otherItem.querySelector(".faq-question");

      otherItem.classList.remove("is-open");

      if (otherQuestion) {
        otherQuestion.setAttribute("aria-expanded", "false");
      }
    });

    if (!isOpen) {
      item.classList.add("is-open");
      question.setAttribute("aria-expanded", "true");
    }
  });
});