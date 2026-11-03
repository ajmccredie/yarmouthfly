
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


  // ==================================================
  // FORMSPREE FORM SUBMISSION
  // Validation, diagnostics and safe fallback
  // ==================================================

  forms.forEach((form) => {
    const status = form.parentElement.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText =
      form.dataset.buttonText || "Send Message";

    let isSubmitting = false;

    // Create a non-personal reference for troubleshooting.
    function createAttemptId() {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }

      return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 10)
      );
    }

    // Send anonymous outcome information to Google Analytics.
    // Never send names, email addresses or message content.
    function trackFormEvent(category, attemptId) {
      if (typeof window.gtag === "function") {
        window.gtag("event", "contact_form_result", {
          form_name: "flighthouse_contact",
          result_category: category,
          attempt_id: attemptId
        });
      }
    }

    function showStatus(message, type = "error") {
      if (!status) return;

      status.textContent = message;
      status.classList.remove("is-error", "is-success");

      status.classList.add(
        type === "success" ? "is-success" : "is-error"
      );
    }

    function resetButton() {
      isSubmitting = false;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }

    function setSendingState() {
      isSubmitting = true;

      if (status) {
        status.textContent = "Sending your message...";
        status.classList.remove("is-error", "is-success");
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }
    }

    function getFieldLabel(field) {
      if (field.id) {
        const label = form.querySelector(
          `label[for="${field.id}"]`
        );

        if (label) {
          return label.textContent.replace("*", "").trim();
        }
      }

      if (field.type === "checkbox") {
        return "Consent";
      }

      return field.name || "This field";
    }

    function getValidationMessage(field) {
      const label = getFieldLabel(field);

      if (field.validity.valueMissing) {
        if (field.type === "checkbox") {
          return "Please tick the consent box before sending.";
        }

        if (field.tagName === "SELECT") {
          return "Please choose the subject of your enquiry.";
        }

        return `Please complete the ${label} field.`;
      }

      if (field.validity.typeMismatch) {
        if (field.type === "email") {
          return "Please enter a valid email address.";
        }
      }

      return `Please check the ${label} field.`;
    }

    function showValidationError(field) {
      if (!field) return;

      field.classList.add("field-invalid");

      showStatus(getValidationMessage(field));

      field.focus();
    }

    // Show clear guidance when native browser validation fails.
    // Invalid events occur before the submit event.
    form.addEventListener(
      "invalid",
      (event) => {
        const field = event.target;

        if (!field || !field.validity) return;

        const attemptId = createAttemptId();

        trackFormEvent("validation_error", attemptId);

        // Only show the first invalid field.
        if (!form.querySelector(".field-invalid")) {
          showValidationError(field);
        }
      },
      true
    );

    // Remove the invalid styling as visitors correct fields.
    form.querySelectorAll("input, select, textarea").forEach(
      (field) => {
        function clearFieldError() {
          if (field.validity && field.validity.valid) {
            field.classList.remove("field-invalid");
          }
        }

        field.addEventListener("input", clearFieldError);
        field.addEventListener("change", clearFieldError);
      }
    );

    function addStandardSubmissionOption(attemptId) {
      if (!status) return;

      const wrapper = document.createElement("div");
      wrapper.className = "form-fallback-options";

      const explanation = document.createElement("p");
      explanation.textContent =
        "If the problem continues, you can try sending your enquiry using the standard browser form.";

      const fallbackButton = document.createElement("button");
      fallbackButton.type = "button";
      fallbackButton.className = "btn form-fallback-btn";
      fallbackButton.textContent = "Try standard submission";

      fallbackButton.addEventListener("click", () => {
        if (!form.reportValidity()) {
          return;
        }

        trackFormEvent("standard_submission_selected", attemptId);

        // This submits directly through the browser.
        // It bypasses our JavaScript submit listener.
        // The visitor will see Formspree's response page.
        HTMLFormElement.prototype.submit.call(form);
      });

      wrapper.appendChild(explanation);
      wrapper.appendChild(fallbackButton);

      status.appendChild(wrapper);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const attemptId = createAttemptId();

      // Explicitly check validity as an additional safeguard.
      if (!form.checkValidity()) {
        form.reportValidity();

        const invalidField = form.querySelector(":invalid");

        if (invalidField) {
          showValidationError(invalidField);
        }

        return;
      }

      // Clear any previous validation styling.
      form.querySelectorAll(".field-invalid").forEach(
        (field) => field.classList.remove("field-invalid")
      );

      setSendingState();

      // Timeout avoids leaving the button on "Sending..."
      // indefinitely. A timeout does not prove the message
      // failed to reach Formspree.
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 20000);

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: {
            Accept: "application/json"
          },
          signal: controller.signal
        });

        if (response.ok) {
          trackFormEvent("success", attemptId);

          form.reset();

          showStatus(
            form.dataset.successMessage ||
            "Thank you. Your message has been sent.",
            "success"
          );

          openPopup();

        } else {
          const httpStatus = response.status;

          trackFormEvent(
            `http_${httpStatus}`,
            attemptId
          );

          if (httpStatus === 429) {
            showStatus(
              "Too many submissions have been received in a short time. Please wait a little before trying again."
            );

          } else if (
            httpStatus === 400 ||
            httpStatus === 422
          ) {
            showStatus(
              "Your message couldn't be accepted. Please check your details and try again."
            );

          } else if (
            httpStatus === 403
          ) {
            showStatus(
              "The form service has refused this submission. Please try standard submission or contact FlightHouse another way."
            );

          } else {
            showStatus(
              "The form service returned an error. Your message has not been confirmed as sent. We are working to fix this issue."
            );
          }

          addStandardSubmissionOption(attemptId);
        }

      } catch (error) {
        const timedOut = error.name === "AbortError";

        trackFormEvent(
          timedOut ? "timeout" : "network_error",
          attemptId
        );

        console.error(
          "FlightHouse contact form error:",
          error
        );

        if (timedOut) {
          showStatus(
            "The request took too long. We couldn't confirm whether your message was received. Please check before trying again."
          );

        } else {
          showStatus(
            "We couldn't confirm that your message was sent. This may be a connection or browser issue. Your message is still here."
          );
        }

        addStandardSubmissionOption(attemptId);

      } finally {
        window.clearTimeout(timeoutId);
        resetButton();
      }
    });
  });
});

// ==================================================
// FAQ ACCORDIONS
// ==================================================

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

// ==================================================
// OPEN CLASS LEVELS FROM INTERNAL CTA
// ==================================================

const urlParams = new URLSearchParams(window.location.search);
const requestedFaq = urlParams.get("open");

if (
  requestedFaq === "class-levels" &&
  window.location.hash === "#class-levels"
) {
  const targetFaq = document.getElementById("class-levels");

  if (targetFaq) {
    const targetQuestion = targetFaq.querySelector(".faq-question");

    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("is-open");

      const question = item.querySelector(".faq-question");

      if (question) {
        question.setAttribute("aria-expanded", "false");
      }
    });

    targetFaq.classList.add("is-open");

    if (targetQuestion) {
      targetQuestion.setAttribute("aria-expanded", "true");
    }

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

    document.body.classList.add("newsletter-open");

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

    document.body.classList.remove("newsletter-open");

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
        newsletterModal.classList.contains("is-open");

      if (event.key === "Escape" && modalIsOpen) {
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
        newsletterForm.querySelector('input[name="EMAIL"]');

      const firstNameInput =
        newsletterForm.querySelector('input[name="FNAME"]');

      const submitButton =
        newsletterForm.querySelector('button[type="submit"]');

      if (!emailInput || !firstNameInput || !submitButton) {
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
      submitButton.textContent = "Signing you up…";

      const callbackName =
        `mailchimpCallback_${Date.now()}`;

      const formData = new FormData(newsletterForm);
      const parameters = new URLSearchParams();

      formData.forEach((value, key) => {
        parameters.append(key, value);
      });

      parameters.append("c", callbackName);

      const script = document.createElement("script");

      function finishRequest() {
        submitButton.disabled = false;
        submitButton.textContent =
          "Sign Up to the Mailing List";

        delete window[callbackName];

        if (script.parentNode) {
          script.remove();
        }
      }

      window[callbackName] = function (response) {
        const rawMessage =
          cleanMailchimpMessage(response?.msg);

        const lowerMessage = rawMessage.toLowerCase();

        if (response?.result === "success") {
          showNewsletterMessage(
            "Thank you! Please check your inbox to confirm your subscription.",
            "success"
          );

          newsletterForm.reset();

        } else if (
          lowerMessage.includes("already subscribed") ||
          lowerMessage.includes("already a list member") ||
          lowerMessage.includes("is already a list member")
        ) {
          showNewsletterMessage(
            "This email address is already on our mailing list, so you’re all set!",
            "success"
          );

        } else if (
          lowerMessage.includes("cannot be added") ||
          lowerMessage.includes("invalid email") ||
          lowerMessage.includes("enter a different email")
        ) {
          showNewsletterMessage(
            "We couldn’t add that email address. Please check it carefully or try a different address."
          );

        } else if (
          lowerMessage.includes("too many") ||
          lowerMessage.includes("try again later")
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
// Legacy handlers retained from supplied script
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

// ==================================================
// CLASS PLAN POPUPS
// Generic - no JS changes needed for future timetables
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const scheduleTriggers =
    document.querySelectorAll("[data-schedule-target]");

  const scheduleModals =
    document.querySelectorAll(".schedule-plan-modal");

  function openScheduleModal(modal) {
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("schedule-plan-open");
  }

  function closeScheduleModal(modal) {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    const anyModalStillOpen =
      document.querySelector(".schedule-plan-modal.is-open");

    if (!anyModalStillOpen) {
      document.body.classList.remove("schedule-plan-open");
    }
  }

  scheduleTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.dataset.scheduleTarget;
      const modal = document.getElementById(targetId);

      openScheduleModal(modal);
    });
  });

  scheduleModals.forEach((modal) => {
    const closeButtons =
      modal.querySelectorAll("[data-schedule-close]");

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        closeScheduleModal(modal);
      });
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeScheduleModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    scheduleModals.forEach((modal) => {
      closeScheduleModal(modal);
    });
  });
});

// ==================================================
// BROKEN IMAGE HANDLING
// ==================================================

document.querySelectorAll("img").forEach((img) => {
  const markAsBroken = () => {
    img.classList.add("broken-image");
  };

  img.addEventListener("error", markAsBroken);

  if (img.complete && img.naturalWidth === 0) {
    markAsBroken();
  }
});

// ==================================================
// SKIP SUBSIDISED PRICING QUESTIONS
// ==================================================

const skipSubsidyBtn =
  document.getElementById("skip-subsidy-btn");

const applicationConfirmation =
  document.getElementById("application-confirmation");

if (skipSubsidyBtn && applicationConfirmation) {
  skipSubsidyBtn.addEventListener("click", () => {
    applicationConfirmation.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
}

// ==================================================
// DROP-IN PRICING PANEL
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const pricingTrigger =
    document.querySelector(".pricing-trigger");

  const pricingPanel =
    document.getElementById("drop-in-pricing");

  if (!pricingTrigger || !pricingPanel) return;

  pricingTrigger.addEventListener("click", () => {
    const isOpen = pricingPanel.classList.toggle("is-open");

    pricingTrigger.setAttribute("aria-expanded", isOpen);

    pricingTrigger.textContent = isOpen
      ? "Hide Prices"
      : "View Prices";
  });
});

// ==================================================
// CLASS PASSES EXPANDABLE PANELS
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const passPanels =
    document.querySelectorAll(".passes-details");

  function loadPassIframe(panel) {
    if (!panel) return;

    const iframe = panel.querySelector(".passes-iframe");

    if (
      iframe &&
      !iframe.getAttribute("src") &&
      iframe.dataset.src
    ) {
      iframe.setAttribute("src", iframe.dataset.src);
    }
  }

  passPanels.forEach((panel) => {
    panel.removeAttribute("open");

    panel.addEventListener("toggle", () => {
      if (panel.open) {
        loadPassIframe(panel);
      }
    });
  });

  document.querySelectorAll("[data-open-passes]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const panelId = link.dataset.openPasses;
      const panel = document.getElementById(panelId);

      if (!panel) return;

      panel.open = true;
      loadPassIframe(panel);
      window.setTimeout(() => {
        panel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    });
  });
});
