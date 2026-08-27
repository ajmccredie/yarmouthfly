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

// ---------- OPEN CLASS LEVELS FROM INTERNAL CTA ----------
const urlParams = new URLSearchParams(window.location.search);
const requestedFaq = urlParams.get("open");

if (
  requestedFaq === "class-levels" &&
  window.location.hash === "#class-levels"
) {
  const targetFaq = document.getElementById("class-levels");

  if (targetFaq) {
    const targetQuestion = targetFaq.querySelector(".faq-question");

    // Close any FAQ that may already be open
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("is-open");

      const question = item.querySelector(".faq-question");

      if (question) {
        question.setAttribute("aria-expanded", "false");
      }
    });

    // Open the class-level section
    targetFaq.classList.add("is-open");

    if (targetQuestion) {
      targetQuestion.setAttribute("aria-expanded", "true");
    }

    // Wait until the page has laid itself out, then scroll neatly into view
    requestAnimationFrame(() => {
      targetFaq.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }
}

// ==================================================
// MAILING LIST POPUP AND MAILCHIMP SUBMISSION
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const newsletterModal =
    document.getElementById("newsletter-modal");

  const newsletterOpenButtons =
    document.querySelectorAll("[data-newsletter-open]");

  const newsletterCloseButton =
    document.querySelector("[data-newsletter-close]");

  const newsletterForm =
    document.getElementById("newsletter-form");

  const newsletterMessage =
    document.getElementById("newsletter-message");

  let lastNewsletterTrigger = null;

  function resetNewsletterMessage() {
    if (!newsletterMessage) {
      return;
    }

    newsletterMessage.textContent = "";
    newsletterMessage.hidden = true;

    newsletterMessage.classList.remove(
      "is-success",
      "is-error"
    );
  }

  function showNewsletterMessage(
    message,
    type = "error"
  ) {
    if (!newsletterMessage) {
      return;
    }

    newsletterMessage.textContent = message;
    newsletterMessage.hidden = false;

    newsletterMessage.classList.remove(
      "is-success",
      "is-error"
    );

    newsletterMessage.classList.add(
      type === "success"
        ? "is-success"
        : "is-error"
    );

    newsletterMessage.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  function cleanMailchimpMessage(message) {
    const temporaryElement =
      document.createElement("div");

    temporaryElement.innerHTML = message || "";

    return (temporaryElement.textContent || "")
      .replace(/^\d+\s*-\s*/, "")
      .trim();
  }

  function openNewsletterModal(triggerButton) {
    if (!newsletterModal) {
      return;
    }

    lastNewsletterTrigger = triggerButton || null;

    resetNewsletterMessage();

    newsletterModal.classList.add("is-open");
    newsletterModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "newsletter-open"
    );

    const firstInput =
      newsletterModal.querySelector(
        'input:not([tabindex="-1"])'
      );

    window.setTimeout(() => {
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  function closeNewsletterModal() {
    if (!newsletterModal) {
      return;
    }

    newsletterModal.classList.remove("is-open");
    newsletterModal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "newsletter-open"
    );

    if (lastNewsletterTrigger) {
      lastNewsletterTrigger.focus();
    }
  }

  newsletterOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openNewsletterModal(button);
    });
  });

  if (newsletterCloseButton) {
    newsletterCloseButton.addEventListener(
      "click",
      closeNewsletterModal
    );
  }

  if (newsletterModal) {
    newsletterModal.addEventListener(
      "click",
      (event) => {
        if (event.target === newsletterModal) {
          closeNewsletterModal();
        }
      }
    );
  }

  document.addEventListener(
    "keydown",
    (event) => {
      const modalIsOpen =
        newsletterModal &&
        newsletterModal.classList.contains(
          "is-open"
        );

      if (
        event.key === "Escape" &&
        modalIsOpen
      ) {
        closeNewsletterModal();
      }
    }
  );

  if (!newsletterForm || !newsletterMessage) {
    return;
  }

  newsletterForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const emailInput =
        newsletterForm.querySelector(
          'input[name="EMAIL"]'
        );

      const firstNameInput =
        newsletterForm.querySelector(
          'input[name="FNAME"]'
        );

      const submitButton =
        newsletterForm.querySelector(
          'button[type="submit"]'
        );

      if (
        !emailInput ||
        !firstNameInput ||
        !submitButton
      ) {
        showNewsletterMessage(
          "The signup form could not be loaded correctly. Please refresh the page and try again."
        );

        return;
      }

      resetNewsletterMessage();

      if (!firstNameInput.value.trim()) {
        showNewsletterMessage(
          "Please enter your first name."
        );

        firstNameInput.focus();
        return;
      }

      if (
        !emailInput.value.trim() ||
        !emailInput.validity.valid
      ) {
        showNewsletterMessage(
          "Please enter a valid email address."
        );

        emailInput.focus();
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent =
        "Signing you up…";

      const callbackName =
        `mailchimpCallback_${Date.now()}`;

      const formData =
        new FormData(newsletterForm);

      const parameters =
        new URLSearchParams();

      formData.forEach((value, key) => {
        parameters.append(key, value);
      });

      parameters.append("c", callbackName);

      const script =
        document.createElement("script");

      function finishRequest() {
        submitButton.disabled = false;
        submitButton.textContent =
          "Sign Up to the Mailing List";

        delete window[callbackName];

        if (script.parentNode) {
          script.remove();
        }
      }

      window[callbackName] = function (
        response
      ) {
        const rawMessage =
          cleanMailchimpMessage(
            response?.msg
          );

        const lowerMessage =
          rawMessage.toLowerCase();

        if (response?.result === "success") {
          showNewsletterMessage(
            "Thank you! Please check your inbox to confirm your subscription.",
            "success"
          );

          newsletterForm.reset();
        } else if (
          lowerMessage.includes(
            "already subscribed"
          ) ||
          lowerMessage.includes(
            "already a list member"
          ) ||
          lowerMessage.includes(
            "is already a list member"
          )
        ) {
          showNewsletterMessage(
            "This email address is already on our mailing list, so you’re all set!",
            "success"
          );
        } else if (
          lowerMessage.includes(
            "cannot be added"
          ) ||
          lowerMessage.includes(
            "invalid email"
          ) ||
          lowerMessage.includes(
            "enter a different email"
          )
        ) {
          showNewsletterMessage(
            "We couldn’t add that email address. Please check it carefully or try a different address."
          );
        } else if (
          lowerMessage.includes(
            "too many"
          ) ||
          lowerMessage.includes(
            "try again later"
          )
        ) {
          showNewsletterMessage(
            "The mailing list is temporarily unable to process the signup. Please wait a moment and try again."
          );
        } else {
          showNewsletterMessage(
            rawMessage ||
            "Something went wrong while signing you up. Please check your details and try again."
          );
        }

        finishRequest();
      };

      script.onerror = function () {
        showNewsletterMessage(
          "We couldn’t connect to the mailing list just now. Please check your connection and try again."
        );

        finishRequest();
      };

      script.src =
        `${newsletterForm.action}&${parameters.toString()}`;

      document.body.appendChild(script);
    }
  );
});

// ==================================================
// CLASS PLAN POPUPS
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const scheduleModals = [
    {
      openButton: document.getElementById("open-summer-plan"),
      modal: document.getElementById("summer-plan-modal"),
      closeButton: document.getElementById("close-summer-plan"),
      doneButton: document.getElementById("close-summer-plan-button"),
    },
    {
      openButton: document.getElementById("open-september-plan"),
      modal: document.getElementById("september-plan-modal"),
      closeButton: document.getElementById("close-september-plan"),
      doneButton: document.getElementById("close-september-plan-button"),
    },
  ];

  function openScheduleModal(modal) {
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("summer-plan-open");
  }

  function closeScheduleModal(modal) {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    const anyModalStillOpen = scheduleModals.some(
      ({ modal }) => modal && modal.classList.contains("is-open")
    );

    if (!anyModalStillOpen) {
      document.body.classList.remove("summer-plan-open");
    }
  }

  scheduleModals.forEach(
    ({ openButton, modal, closeButton, doneButton }) => {
      if (!modal) return;

      if (openButton) {
        openButton.addEventListener("click", () => {
          openScheduleModal(modal);
        });
      }

      if (closeButton) {
        closeButton.addEventListener("click", () => {
          closeScheduleModal(modal);
        });
      }

      if (doneButton) {
        doneButton.addEventListener("click", () => {
          closeScheduleModal(modal);
        });
      }

      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeScheduleModal(modal);
        }
      });
    }
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      scheduleModals.forEach(({ modal }) => {
        closeScheduleModal(modal);
      });
    }
  });
});

// ---------- BROKEN IMAGE HANDLING ----------

document.querySelectorAll('img').forEach((img) => {

    const markAsBroken = () => {
        img.classList.add('broken-image');
    };

    img.addEventListener('error', markAsBroken);

    // Catch images which failed before the JS loaded
    if (img.complete && img.naturalWidth === 0) {
        markAsBroken();
    }

});

// ---------- SKIP SUBSIDISED PRICING QUESTIONS ----------

const skipSubsidyBtn = document.getElementById('skip-subsidy-btn');
const applicationConfirmation = document.getElementById('application-confirmation');

if (skipSubsidyBtn && applicationConfirmation) {

  skipSubsidyBtn.addEventListener('click', () => {

    applicationConfirmation.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

  });

}