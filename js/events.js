
// =========================================
// FLIGHTHOUSE UPCOMING EVENTS
//
// Add, remove or update events here.
// Set active to false to hide an event.
//
// Optional fields:
// image       - Event poster filename
// offer       - Special offer on event card
// bookingNote - Instructions inside popup
//
// salesEnd uses YYYY-MM-DDTHH:MM:SS
// Include the correct UK time offset:
// GMT = +00:00
// BST = +01:00
// =========================================

const flightHouseEvents = [

    // =====================================
    // STUDENT CHRISTMAS SHOW
    // =====================================

    {
        id: "student-christmas-show",

        title: "Student Christmas Show",

        date: "Thursday 17 December 2026 | 7:30pm – 9pm",

        salesEnd: "2026-12-17T19:30:00+00:00",

        description:
            "Join us for a festive celebration of flying trapeze and local aerial talent! Enjoy performances from our FlightHouse students and guest aerial artists, alongside a Christmas raffle with fantastic prizes, including trapeze classes, class bundles, merchandise and Hippodrome show tickets.",

        offer: "Doors open at 6:30pm | Show starts at 7:30pm",

        bookingNote:
            "Doors open at 6:30pm, with the show starting at 7:30pm. Don't forget to enter our Christmas raffle!",

        image: "",

        bookingUrl:
            "https://bookwhen.com/flighthouse?start=2026-12-16T00%3A00%3A00.000%2B00%3A00#focus=ev-swssw-20261217193000",

        iframeUrl:
            "https://bookwhen.com/flighthouse/iframe/e/ev-swssw-20261217193000",

        active: true
    },


    // =====================================
    // RISQUÉ SHOW
    // =====================================

    {
        id: "risque-show",

        title: "Risqué — The Show",

        date: "Saturday 19 December 2026 | 9pm – 10:30pm | Ages 16+",

        salesEnd: "2026-12-19T21:00:00+00:00",

        description:
            "A Night of Jaw-Dropping Feats and Seductive Beats. Steal This Circus Productions and Sculpted GY present a brand-new, one-night-only burlesque production showcasing Norfolk and the UK's emerging talent. Guided by the wonderful Pearl Laceneck, prepare for a journey through the absurd, the sexy and the astounding. Ages 16+.",

        offer: "£10 SHOW ONLY / £15 SHOW + AFTER-PARTY (18+)",

        bookingNote:
            "SPECIAL OFFER: Add both the Risqué Show and After-Party tickets to your basket for just £15. Combined tickets are for ages 18+.",

        image: "",

        bookingUrl:
            "https://bookwhen.com/flighthouse?start=2026-12-16T00%3A00%3A00.000%2B00%3A00#focus=ev-si2gw-20261219210000",

        iframeUrl:
            "https://bookwhen.com/flighthouse/iframe/e/ev-si2gw-20261219210000",

        active: true
    },


    // =====================================
    // RISQUÉ AFTER-PARTY
    // =====================================

    {
        id: "risque-after-party",

        title: "Risqué — The After-Party",

        date: "Saturday 19 December 2026 | 10:30pm – 2:30am (Sunday) | Ages 18+",

        salesEnd: "2026-12-19T22:30:00+00:00",

        description:
            "Head downstairs to the legendary Viper Room for an exclusive electronic circus rave hosted by Sculpted GY. Expect breathtaking aerials, heavy drum and bass, and the ultimate end-of-year celebration. Doors reopen at 10:30pm. Both the Empire Theatre and the Viper Room feature fully functioning live bars. Strictly ages 18+.",

        offer: "£7.50 AFTER-PARTY | £15 COMBINED TICKET",

        bookingNote:
            "After-party tickets are £7.50. Alternatively, add both the Risqué Show and After-Party tickets to your basket for just £15. Strictly ages 18+.",

        image: "",

        bookingUrl:
            "https://bookwhen.com/flighthouse?start=2026-12-16T00%3A00%3A00.000%2B00%3A00#focus=ev-s74cs-20261219223000",

        iframeUrl:
            "https://bookwhen.com/flighthouse/iframe/e/ev-s74cs-20261219223000",

        active: true
    }

];


// =========================================
// FLIGHTHOUSE EVENTS ENGINE
//
// Automatically generates event cards,
// handles booking windows and hides
// events once ticket sales have ended.
//
// No routine editing required below here.
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // PAGE ELEMENTS
    // =====================================

    const eventsList = document.getElementById("events-list");
    const noEvents = document.getElementById("no-events");

    const modal = document.getElementById("event-booking-modal");
    const modalTitle = document.getElementById("event-modal-title");
    const modalDate = document.getElementById("event-modal-date");
    const modalOffer = document.getElementById("event-modal-offer");
    const modalIframe = document.getElementById("event-booking-iframe");
    const modalLink = document.getElementById("event-booking-link");

    const closeButton = document.getElementById("event-modal-close");
    const doneButton = document.getElementById("event-modal-done");

    // Stop safely if the required elements do not exist

    if (
        !eventsList ||
        !noEvents ||
        !modal ||
        !modalTitle ||
        !modalDate ||
        !modalIframe ||
        !modalLink ||
        !closeButton ||
        !doneButton
    ) {
        return;
    }

    let previousFocus = null;


    // =====================================
    // CHECK EVENT AVAILABILITY
    // =====================================

    function isAvailable(event) {

        // Manually disabled event
        if (!event.active) return false;

        // Do not advertise events without booking links
        if (!event.bookingUrl || !event.iframeUrl) return false;

        // No expiry date supplied
        if (!event.salesEnd) return true;

        const endDate = new Date(event.salesEnd);

        // Hide events with invalid expiry dates
        if (Number.isNaN(endDate.getTime())) {
            console.warn(
                `Invalid salesEnd date for event: ${event.title}`
            );
            return false;
        }

        // Only display events before ticket sales close
        return endDate.getTime() > Date.now();

    }


    // =====================================
    // OPEN EVENT BOOKING WINDOW
    // =====================================

    function openEvent(event) {

        // Recheck availability before opening
        if (!isAvailable(event)) {
            renderEvents();
            return;
        }

        // Fallback for browsers without dialog support
        if (typeof modal.showModal !== "function") {
            window.location.href = event.bookingUrl;
            return;
        }

        if (modal.open) return;

        previousFocus = document.activeElement;

        // Populate event details
        modalTitle.textContent = event.title;
        modalDate.textContent = event.date;

        // Optional booking instructions or special offer
        if (modalOffer) {

            modalOffer.textContent = event.bookingNote || "";
            modalOffer.hidden = !event.bookingNote;

        }

        // Direct booking fallback link
        modalLink.href = event.bookingUrl;

        // Configure iframe
        modalIframe.title = `Book tickets for ${event.title}`;

        try {

            // Open modal
            modal.showModal();

            // Prevent background scrolling
            document.body.classList.add("event-modal-open");

            // Only load Bookwhen when the modal opens
            modalIframe.src = event.iframeUrl;

            // Move keyboard focus into modal
            closeButton.focus();

        } catch (error) {

            console.error("Unable to open event booking:", error);

            document.body.classList.remove("event-modal-open");

            modalIframe.removeAttribute("src");

            if (modal.open) {
                modal.close();
            }

            // Fall back to the direct booking page
            window.location.href = event.bookingUrl;

        }

    }


    // =====================================
    // CLOSE BOOKING WINDOW
    // =====================================

    function closeEvent() {

        if (modal.open) {
            modal.close();
        }

    }

    closeButton.addEventListener("click", closeEvent);
    doneButton.addEventListener("click", closeEvent);


    // =====================================
    // CLEAN UP AFTER CLOSING
    //
    // Also runs when Escape is pressed.
    // =====================================

    modal.addEventListener("close", () => {

        // Restore normal page scrolling
        document.body.classList.remove("event-modal-open");

        // Unload the Bookwhen iframe
        modalIframe.removeAttribute("src");

        // Clear the optional booking message
        if (modalOffer) {
            modalOffer.textContent = "";
            modalOffer.hidden = true;
        }

        // Restore keyboard focus to the original button
        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }

        previousFocus = null;

    });


    // =====================================
    // CLOSE WHEN CLICKING OUTSIDE MODAL
    // =====================================

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            const bounds = modal.getBoundingClientRect();

            const outside =
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom;

            if (outside) {
                closeEvent();
            }

        }

    });


    // =====================================
    // GENERATE EVENT CARDS
    // =====================================

    function renderEvents() {

        const upcomingEvents =
            flightHouseEvents.filter(isAvailable);

        // Clear existing event cards
        eventsList.replaceChildren();

        // Show the appropriate page content
        noEvents.hidden = upcomingEvents.length > 0;
        eventsList.hidden = upcomingEvents.length === 0;


        upcomingEvents.forEach((event) => {

            // Create event card

            const card = document.createElement("article");
            card.className = "event-card";


            // =================================
            // OPTIONAL EVENT POSTER
            // =================================

            if (event.image) {

                const image = document.createElement("img");

                image.src = event.image;
                image.alt = `${event.title} event poster`;
                image.className = "event-card-image";
                image.loading = "lazy";
                image.decoding = "async";

                // Hide missing or broken images
                image.addEventListener("error", () => {
                    image.remove();
                });

                card.appendChild(image);

            }


            // =================================
            // EVENT TITLE
            // =================================

            const title = document.createElement("h3");

            title.textContent = event.title;

            card.appendChild(title);


            // =================================
            // EVENT DATE AND TIME
            // =================================

            const date = document.createElement("p");

            date.className = "event-card-date";
            date.textContent = event.date;

            card.appendChild(date);


            // =================================
            // EVENT DESCRIPTION
            // =================================

            const description = document.createElement("p");

            description.className = "event-card-description";
            description.textContent = event.description;

            card.appendChild(description);


            // =================================
            // OPTIONAL SPECIAL OFFER BANNER
            // =================================

            if (event.offer) {

                const offer = document.createElement("div");

                offer.className = "event-card-offer";
                offer.textContent = event.offer;

                card.appendChild(offer);

            }


            // =================================
            // BOOKING BUTTON
            // =================================

            const button = document.createElement("button");

            button.type = "button";
            button.className = "btn";
            button.textContent = "Book Tickets";

            button.setAttribute("aria-haspopup", "dialog");

            button.setAttribute(
                "aria-controls",
                "event-booking-modal"
            );

            button.setAttribute(
                "aria-label",
                `Book tickets for ${event.title}`
            );

            button.addEventListener("click", () => {
                openEvent(event);
            });

            card.appendChild(button);


            // =================================
            // ADD COMPLETED CARD TO PAGE
            // =================================

            eventsList.appendChild(card);

        });

    }


    // =====================================
    // INITIALISE EVENTS PAGE
    // =====================================

    renderEvents();


    // =====================================
    // REFRESH WHEN RETURNING TO PAGE
    //
    // Rechecks expired events when a visitor
    // returns using their browser back button.
    // =====================================

    window.addEventListener("pageshow", (event) => {

        if (event.persisted && !modal.open) {
            renderEvents();
        }

    });

});
