
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const scholarshipList = document.querySelector(".scholarship-list");

const scholarshipCards = document.querySelectorAll(".scholarship-card");

// Search function
function searchScholarships() {

    const searchValue = searchInput.value.trim().toLowerCase();

    let found = 0;

    // If search is empty, hide the results
    if (searchValue === "") {
        scholarshipList.style.display = "none";
        return;
    }

    // Show the scholarship list
    scholarshipList.style.display = "flex";

    scholarshipCards.forEach(card => {

        const cardText = card.textContent.toLowerCase();

        if (cardText.includes(searchValue)) {
            card.style.display = "block";
            found++;
        } else {
            card.style.display = "none";
        }

    });

    // Display message if no results
    let noResults = document.getElementById("noResults");

    if (!noResults) {
        noResults = document.createElement("p");
        noResults.id = "noResults";
        noResults.textContent = "No scholarships found. Try another keyword.";
        scholarshipList.appendChild(noResults);
    }

    noResults.style.display = found === 0 ? "block" : "none";
}

// Search button
searchButton.addEventListener("click", searchScholarships);

// Remove results when input is cleared
searchInput.addEventListener("input", function() {

    if (searchInput.value.trim() === "") {

        scholarshipList.style.display = "none";

        scholarshipCards.forEach(card => {
            card.style.display = "block";
        });

        const noResults = document.getElementById("noResults");

        if (noResults) {
            noResults.style.display = "none";
        }

    }

});

// Press Enter to search
searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchScholarships();
    }
});

// SCHOLARSHIP DETAILS FILTER

document.addEventListener("DOMContentLoaded", function () {

    if (!document.body.classList.contains("details-body")) {
        return;
    }

    const sections = document.querySelectorAll(".scholarship-info");

    function displayScholarship() {

        const selectedID = window.location.hash.substring(1);

        sections.forEach(function(section) {

            section.hidden = section.id !== selectedID;

        });

    }

    displayScholarship();

    window.addEventListener("hashchange", displayScholarship);

});