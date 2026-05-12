document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a");
  const forms = document.querySelectorAll("[data-formspree-form]");
  const yearEl = document.getElementById("year");

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
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  forms.forEach((form) => {
    const status = form.parentElement.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

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
      }
    });
  });
});