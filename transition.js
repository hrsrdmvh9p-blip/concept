
// ==========================================
// ISKOURCE - HOMEPAGE ZOOM TRANSITION
// ==========================================

// Destination mapping
const transitionMap = {
    "scholarships.html": "directory-morph",
    "tracker.html": "tracker-morph",
    "eligibility.html": "eligibility-morph",
    "scholarships.html#dost": "dost-morph",
    "scholarships.html#ched": "ched-morph",
    "scholarships.html#sm": "sm-morph"
};

// Identify destination
function getMorphName(url) {
    const path = url.pathname.split("/").pop();
    const key = path + url.hash;

    return transitionMap[key] || transitionMap[path] || null;
}

// Homepage click animation
document.addEventListener("click", function(event) {

    const card = event.target.closest(
        ".feature-card, .scholarship-card"
    );

    if (!card) return;

    const link = card.closest("a");

    if (!link) return;

    const destination = new URL(link.href, location.href);
    const morphName = getMorphName(destination);

    // Let the browser handle the directory shared-element morph
if (morphName === "directory-morph") {
    return;
}

    if (
        !morphName ||
        destination.origin !== location.origin ||
        destination.href === location.href ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
    ) {
        return;
    }

    event.preventDefault();

    if (document.body.classList.contains("is-transitioning")) {
        return;
    }

    document.body.classList.add("is-transitioning");

    

const rect = card.getBoundingClientRect();

// Calculate distance from card center to screen center
const moveX = (window.innerWidth / 2) -
              (rect.left + rect.width / 2);

const moveY = (window.innerHeight / 2) -
              (rect.top + rect.height / 2);


// Save movement values
card.style.setProperty("--move-x", moveX + "px");
card.style.setProperty("--move-y", moveY + "px");


// Mark selected card
card.classList.add("morph-selected");

// Blur everything alongside the selected card
let current = card;

while (current && current !== document.querySelector(".homepage")) {

    const parent = current.parentElement;

    if (!parent) break;

    Array.from(parent.children).forEach(function(sibling) {
        if (sibling !== current) {
            sibling.classList.add("morph-background");
        }
    });

    current = parent;
}

document.body.classList.add("zoom-to-card");



    setTimeout(function() {
        window.location.href = destination.href;
    }, 1600);

});
