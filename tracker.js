
// ==========================================
// ISKOURCE - SCHOLARSHIP TRACKER
// ==========================================


// SCHOLARSHIPS FROM THE DIRECTORY

const availableScholarships = [
    {
        id: "dost",
        name: "DOST-SEI S&T",
        organization: "Department of Science and Technology",
        logo: "images/dost.png"
    },
    {
        id: "ayala_ugo",
        name: "Ayala U-Go Scholarship Grant",
        organization: "Ayala Foundation, Inc.",
        logo: "images/ayala.png"
    },
    {
        id: "cebuana_lhuillier",
        name: "Cebuana Lhuillier Scholarship",
        organization: "Cebuana Lhuillier Foundation, Inc.",
        logo: "images/cebuana.png"
    },
    {
        id: "ched_merit",
        name: "CHED Merit Scholarship",
        organization: "Commission on Higher Education",
        logo: "images/ched.png"
    },
    {
        id: "owwa_education",
        name: "OWWA Education for Development",
        organization: "Overseas Workers Welfare Administration",
        logo: "images/owwa.png"
    },
    {
        id: "sm_college",
        name: "SM College Scholarship Program",
        organization: "SM Foundation, Inc.",
        logo: "images/sm.png"
    },
    {
        id: "silka_alaga",
        name: "Silka ALAGA",
        organization: "Silka Skincare",
        logo: "images/silka.png"
    },
    {
        id: "sbfi_internal",
        name: "SBFI Internal Scholarship",
        organization: "Security Bank Foundation, Inc.",
        logo: "images/secubank.png"
    },
    {
        id: "megaworld",
        name: "Megaworld Foundation Scholarship",
        organization: "Megaworld Foundation",
        logo: "images/megaworld.png"
    },
    {
        id: "grab_merit",
        name: "Grab Merit-Based Scholarship Program",
        organization: "Grab Philippines",
        logo: "images/grab.png"
    },
    {
        id: "owwa_cmwss",
        name: "OWWA Congressional Migrant Workers Scholarship",
        organization: "Overseas Workers Welfare Administration",
        logo: "images/owwa.png"
    },
    {
        id: "owwa_ofw_dependent",
        name: "OWWA OFW Dependent Scholarship Program",
        organization: "Overseas Workers Welfare Administration",
        logo: "images/owwa.png"
    },
    {
        id: "gokongwei_foundation",
        name: "Gokongwei Brothers Foundation Scholarship",
        organization: "Gokongwei Brothers Foundation",
        logo: "images/gokongwei.png"
    },
    {
        id: "inquirer_grant",
        name: "Inquirer Scholarship Grant",
        organization: "The Inquirer Foundation",
        logo: "images/inquirer.png"
    }
];


// STORAGE

const STORAGE_KEY = "iskourceApplications";

let applications = [];

try {
    const savedApplications = localStorage.getItem(STORAGE_KEY);
    applications = savedApplications
        ? JSON.parse(savedApplications)
        : [];

    if (!Array.isArray(applications)) {
        applications = [];
    }
} catch (error) {
    applications = [];
}

function saveApplications() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(applications)
    );
}


// HELPER FUNCTIONS

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character];
    });
}

function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    if (!date) return "Not provided";

    const parsedDate = new Date(date + "T00:00:00");

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not provided";
    }

    return parsedDate.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function getScholarship(id) {
    return availableScholarships.find(
        scholarship => scholarship.id === id
    );
}

function getStatusClass(status) {
    return status.toLowerCase().replace(/\s+/g, "-");
}


// ADD APPLICATION MODAL

function createApplicationModal() {

    if (document.getElementById("applicationModal")) return;

    const modal = document.createElement("div");

    modal.id = "applicationModal";
    modal.className = "tracker-modal";

    modal.innerHTML = `
        <div class="tracker-modal-content">

            <button class="modal-close-btn" id="closeApplicationModal">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <span class="tracker-eyebrow">APPLICATION MANAGEMENT</span>

            <h2>Add Scholarship Application</h2>

            <p class="modal-description">
                Select a scholarship from the ISKOURCE Directory
                and enter your application information.
            </p>

            <form id="applicationForm">

                <label for="scholarshipSelect">
                    Scholarship
                </label>

                <select id="scholarshipSelect" required>
                    <option value="">Select a scholarship</option>

                    ${availableScholarships.map(scholarship => `
                        <option value="${scholarship.id}">
                            ${escapeHTML(scholarship.name)}
                        </option>
                    `).join("")}

                </select>

                <label for="applicationDate">
                    Application Date
                </label>

                <input
                    type="date"
                    id="applicationDate"
                    value="${getLocalDate()}"
                    required
                >

                <label for="initialApplicationStatus">
                    Application Status
                </label>

                <select id="initialApplicationStatus" required>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <div class="modal-actions">

                    <button
                        type="button"
                        class="modal-cancel-btn"
                        id="cancelApplication"
                    >
                        Cancel
                    </button>

                    <button type="submit" class="modal-save-btn">
                        <i class="fa-solid fa-plus"></i>
                        Add Application
                    </button>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeApplicationModal")
        .addEventListener("click", closeApplicationModal);

    document.getElementById("cancelApplication")
        .addEventListener("click", closeApplicationModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeApplicationModal();
        }
    });

    document.getElementById("applicationForm")
        .addEventListener("submit", addApplication);
}


function openApplicationModal() {
    createApplicationModal();

    const modal = document.getElementById("applicationModal");

    document.getElementById("applicationForm").reset();
    document.getElementById("applicationDate").value = getLocalDate();

    modal.classList.add("show");
}


function closeApplicationModal() {
    const modal = document.getElementById("applicationModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


// ADD APPLICATION

function addApplication(event) {
    event.preventDefault();

    const scholarshipId =
        document.getElementById("scholarshipSelect").value;

    const applicationDate =
        document.getElementById("applicationDate").value;

    const status =
        document.getElementById("initialApplicationStatus").value;

    const scholarship = getScholarship(scholarshipId);

    if (!scholarship || !applicationDate) {
        alert("Please complete all required fields.");
        return;
    }

    const alreadyAdded = applications.some(
        application => application.scholarshipId === scholarshipId
    );

    if (alreadyAdded) {
        alert("This scholarship is already in your application tracker.");
        return;
    }

    const newApplication = {
        id: Date.now().toString(),
        scholarshipId: scholarshipId,
        applicationDate: applicationDate,
        status: status
    };

    applications.push(newApplication);

    saveApplications();
    renderApplications();
    closeApplicationModal();

    showApplicationDetails(newApplication.id);
}


// RENDER APPLICATION CARDS

function renderApplications() {

    const applicationList =
        document.getElementById("applicationList");

    const searchInput =
        document.getElementById("applicationSearch");

    const statusFilter =
        document.getElementById("applicationStatusFilter");

    const searchTerm = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredApplications = applications.filter(application => {

        const scholarship = getScholarship(application.scholarshipId);

        if (!scholarship) return false;

        const matchesSearch =
            scholarship.name.toLowerCase().includes(searchTerm) ||
            scholarship.organization.toLowerCase().includes(searchTerm);

        const matchesStatus =
            selectedStatus === "All" ||
            application.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });


    if (filteredApplications.length === 0) {

        if (applications.length === 0) {

            applicationList.innerHTML = `
                <div class="tracker-empty-state">

                    <i class="fa-solid fa-folder-open"></i>

                    <h3>No Applications Yet</h3>

                    <p>
                        Add a scholarship application to start tracking
                        your progress.
                    </p>

                </div>
            `;

        } else {

            applicationList.innerHTML = `
                <div class="tracker-empty-state">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <h3>No Matching Applications</h3>

                    <p>
                        Try changing your search or status filter.
                    </p>

                </div>
            `;

        }

    } else {

        applicationList.innerHTML = filteredApplications.map(application => {

            const scholarship = getScholarship(application.scholarshipId);

            const statusClass = getStatusClass(application.status);

            return `
                <article class="tracker-application-card"
                    data-application-id="${escapeHTML(application.id)}">

                    <div class="application-card-top">

                        <div class="application-scholarship-logo">
                            <img
                                src="${escapeHTML(scholarship.logo)}"
                                alt="${escapeHTML(scholarship.name)} logo"
                            >
                        </div>

                        <span class="application-status ${statusClass}">
                            ${escapeHTML(application.status)}
                        </span>

                    </div>

                    <div class="application-card-info">

                        <span class="application-organization">
                            ${escapeHTML(scholarship.organization)}
                        </span>

                        <h3>
                            ${escapeHTML(scholarship.name)}
                        </h3>

                        <p>
                            <i class="fa-solid fa-calendar-days"></i>
                            Applied: ${formatDate(application.applicationDate)}
                        </p>

                    </div>

                    <div class="application-card-actions">

                        <button
                            class="view-application-btn"
                            data-action="view"
                            data-id="${escapeHTML(application.id)}"
                        >
                            View Details
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>

                        <select
                            class="application-status-select"
                            data-action="status"
                            data-id="${escapeHTML(application.id)}"
                            aria-label="Change application status"
                        >
                            ${["Pending", "Under Review", "Approved", "Rejected"]
                                .map(status => `
                                    <option
                                        value="${status}"
                                        ${application.status === status ? "selected" : ""}
                                    >
                                        ${status}
                                    </option>
                                `).join("")}
                        </select>

                    </div>

                </article>
            `;

        }).join("");

    }

    updateSummary();
}


// UPDATE SUMMARY CARDS

function updateSummary() {

    document.getElementById("totalApplications").textContent =
        applications.length;

    document.getElementById("pendingApplications").textContent =
        applications.filter(app => app.status === "Pending").length;

    document.getElementById("reviewApplications").textContent =
        applications.filter(app => app.status === "Under Review").length;

    document.getElementById("approvedApplications").textContent =
        applications.filter(app => app.status === "Approved").length;
}


// CHANGE APPLICATION STATUS

function updateApplicationStatus(applicationId, newStatus) {

    const application = applications.find(
        app => app.id === applicationId
    );

    if (!application) return;

    application.status = newStatus;

    saveApplications();
    renderApplications();

    const selectedDetails = document.getElementById("applicationDetails");

    if (selectedDetails.dataset.selectedId === applicationId) {
        showApplicationDetails(applicationId);
    }
}


// VIEW APPLICATION DETAILS

function showApplicationDetails(applicationId) {

    const application = applications.find(
        app => app.id === applicationId
    );

    if (!application) return;

    const scholarship = getScholarship(application.scholarshipId);

    if (!scholarship) return;

    const details = document.getElementById("applicationDetails");

    details.dataset.selectedId = applicationId;

    details.classList.add("has-application");

    details.innerHTML = `

        <div class="selected-application-header">

            <div class="selected-application-logo">
                <img
                    src="${escapeHTML(scholarship.logo)}"
                    alt="${escapeHTML(scholarship.name)} logo"
                >
            </div>

            <div>
                <span class="application-organization">
                    ${escapeHTML(scholarship.organization)}
                </span>

                <h3>${escapeHTML(scholarship.name)}</h3>
            </div>

        </div>


        <div class="selected-application-information">

            <div class="selected-info-item">
                <span>Application Date</span>
                <strong>${formatDate(application.applicationDate)}</strong>
            </div>

            <div class="selected-info-item">
                <span>Current Status</span>

                <strong class="application-status ${getStatusClass(application.status)}">
                    ${escapeHTML(application.status)}
                </strong>
            </div>

            <div class="selected-info-item">
                <span>Organization</span>
                <strong>${escapeHTML(scholarship.organization)}</strong>
            </div>

        </div>


        <div class="selected-application-actions">

            <label for="detailsStatus">
                Update Application Status
            </label>

            <select id="detailsStatus">

                ${["Pending", "Under Review", "Approved", "Rejected"]
                    .map(status => `
                        <option
                            value="${status}"
                            ${application.status === status ? "selected" : ""}
                        >
                            ${status}
                        </option>
                    `).join("")}

            </select>

            <button class="remove-application-btn" id="removeApplication">
                <i class="fa-solid fa-trash"></i>
                Remove Application
            </button>

        </div>

    `;

    document.getElementById("detailsStatus")
        .addEventListener("change", function () {
            updateApplicationStatus(applicationId, this.value);
        });

    document.getElementById("removeApplication")
        .addEventListener("click", function () {

            const confirmed = confirm(
                "Are you sure you want to remove this application?"
            );

            if (!confirmed) return;

            applications = applications.filter(
                app => app.id !== applicationId
            );

            saveApplications();
            renderApplications();

            details.removeAttribute("data-selected-id");
            details.classList.remove("has-application");

            details.innerHTML = `
                <i class="fa-solid fa-file-circle-question"></i>

                <h3>No Application Selected</h3>

                <p>
                    Select an application from your list to view its details.
                </p>
            `;
        });

}


// EVENT LISTENERS

document.getElementById("addApplicationBtn")
    .addEventListener("click", openApplicationModal);


document.getElementById("applicationSearch")
    .addEventListener("input", renderApplications);


document.getElementById("applicationStatusFilter")
    .addEventListener("change", renderApplications);


document.getElementById("applicationList")
    .addEventListener("click", function (event) {

        const button = event.target.closest('[data-action="view"]');

        if (!button) return;

        showApplicationDetails(button.dataset.id);
    });


document.getElementById("applicationList")
    .addEventListener("change", function (event) {

        const select = event.target.closest('[data-action="status"]');

        if (!select) return;

        updateApplicationStatus(
            select.dataset.id,
            select.value
        );
    });


// INITIAL DISPLAY

renderApplications();
