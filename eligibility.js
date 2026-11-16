
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("eligibilityForm");
    const resultsSection = document.getElementById("eligibilityResults");

    if (!form || !resultsSection) return;


    // =====================================
    // GET SHARED SCHOLARSHIP DATA
    // =====================================

    const scholarships = window.scholarshipData;

    if (!scholarships) {
        console.error("Scholarship data was not loaded.");

        resultsSection.innerHTML = `
            <h2>Unable to Load Scholarships</h2>
            <p>Please check the scholarship-data.js file.</p>
        `;

        return;
    }


    // =====================================
    // GET STUDENT INFORMATION
    // =====================================

    function getStudentInformation() {

        return {
            name: document.getElementById("studentName").value.trim(),
            school: document.getElementById("studentSchool").value.trim(),
            location: document.getElementById("studentLocation").value.trim(),
            course: document.getElementById("studentCourse").value.trim(),
            year: document.getElementById("studentYear").value,
            gwa: Number(document.getElementById("studentGWA").value),
            academicStatus: document.getElementById("academicStatus").value,
            income: document.getElementById("familyIncome").value,
            assistance: document.getElementById("financialAssistance").value,
            citizenship: document.getElementById("studentCitizenship").value,
            disability: document.getElementById("studentDisability").value
        };

    }


    // =====================================
    // INCOME RANGE
    // =====================================

    const incomeRanges = {

        "below-100k": {
            min: 0,
            max: 100000
        },

        "100k-200k": {
            min: 100000,
            max: 200000
        },

        "200k-300k": {
            min: 200000,
            max: 300000
        },

        "300k-400k": {
            min: 300000,
            max: 400000
        },

        "400k-500k": {
            min: 400000,
            max: 500000
        },

        "above-500k": {
            min: 500000,
            max: Infinity
        }

    };


    // =====================================
    // GET SCHOLARSHIP REQUIREMENTS
    // =====================================

    function getScholarshipRequirements(data) {

        const eligibility = data.overview?.eligibility || [];

        const reminders = data.reminders || [];

        const target = data.overview?.targetStudents || "";

        return [
            ...eligibility,
            ...reminders,
            target
        ].join(" ").toLowerCase();

    }


    // =====================================
    // CHECK CITIZENSHIP
    // =====================================

    function checkCitizenship(text, student, reasons) {

        if (
            text.includes("filipino citizen") ||
            text.includes("natural-born filipino")
        ) {

            if (student.citizenship !== "Filipino") {

                reasons.push("The scholarship requires Filipino citizenship.");

                return false;

            }

        }

        return true;

    }


    // =====================================
    // CHECK YEAR LEVEL
    // =====================================

    function checkYearLevel(text, student, reasons) {

        const year = student.year;

        // Scholarships specifically requiring college students.

        if (
            /second[- ]to[- ]fifth[- ]year|second year.*college|continuing college student/i.test(text)
        ) {

            if (year === "Grade 11" || year === "Grade 12") {

                reasons.push("This scholarship requires a current college student.");

                return false;

            }

        }

        // Scholarships specifically for incoming freshmen.

        if (
            /incoming college freshman|incoming freshmen|incoming first[- ]year/i.test(text)
        ) {

            if (
                ["2nd Year", "3rd Year", "4th Year", "5th Year"].includes(year)
            ) {

                reasons.push("This scholarship is intended for incoming college freshmen.");

                return false;

            }

        }

        return true;

    }


    // =====================================
    // CHECK GWA
    // =====================================

    function checkGWA(text, student, reasons, unknown) {

        const isSeniorHigh =
            student.year === "Grade 11" ||
            student.year === "Grade 12";

        const gwaRequirements = [
            ...text.matchAll(
                /(?:at least|minimum of|of)\s*(\d{2,3}(?:\.\d+)?)\s*%/gi
            )
        ];

        const thresholds = gwaRequirements
            .map(match => Number(match[1]))
            .filter(value => value >= 60 && value <= 100);

        if (thresholds.length === 0) return true;

        if (isSeniorHigh) {

            const requiredGWA = Math.min(...thresholds);

            if (student.gwa < requiredGWA) {

                reasons.push(
                    `Your general average is below the stated minimum of ${requiredGWA}%.`
                );

                return false;

            }

        } else {

            unknown.push(
                "The scholarship has a percentage-based grade requirement. Your college grading scale must be verified for equivalence."
            );

        }

        return true;

    }


    // =====================================
    // CHECK FAMILY INCOME
    // =====================================

    function checkIncome(text, student, reasons, unknown) {

        const range = incomeRanges[student.income];

        if (!range) return true;

        const incomeRequirement =
            /(?:annual|yearly|total|combined)?\s*(?:gross\s*)?(?:family|household)\s*income[^.]{0,100}?(?:not exceed|must not exceed|no more than|maximum of|below|less than|up to)\s*(?:php|₱)?\s*([\d,]+)/i;

        const match = text.match(incomeRequirement);

        if (!match) return true;

        const maximumIncome = Number(
            match[1].replace(/,/g, "")
        );

        if (range.min > maximumIncome) {

            reasons.push(
                `Your selected family income range is above the stated PHP ${maximumIncome.toLocaleString()} limit.`
            );

            return false;

        }

        if (range.max > maximumIncome) {

            unknown.push(
                `Your selected income range overlaps the scholarship's PHP ${maximumIncome.toLocaleString()} income limit.`
            );

        }

        return true;

    }


    // =====================================
    // CHECK EXISTING FINANCIAL ASSISTANCE
    // =====================================

    function checkFinancialAssistance(text, student, reasons) {

        const prohibitsOtherScholarship =
            /must not have any existing scholarship|must not be receiving another scholarship|must not have another existing scholarship|no other scholarship/i.test(text);

        if (
            prohibitsOtherScholarship &&
            student.assistance === "Yes"
        ) {

            reasons.push(
                "The scholarship does not allow applicants with another existing scholarship."
            );

            return false;

        }

        return true;

    }


    // =====================================
    // CHECK SCHOLARSHIP
    // =====================================

    function evaluateScholarship(key, data, student) {

        const text = getScholarshipRequirements(data);

        const reasons = [];
        const unknown = [];

        checkCitizenship(text, student, reasons);

        checkYearLevel(text, student, reasons);

        checkGWA(text, student, reasons, unknown);

        checkIncome(text, student, reasons, unknown);

        checkFinancialAssistance(text, student, reasons);


        // Some qualifications cannot be checked
        // because the form does not ask for them.

        if (
            /female student|male student|daughter|son of an ofw|child or sibling of.*ofw|ofw member|cebuana lhuillier client|stem class|top 5%|top 20%|partner school|priority program|public university|private school|no grade below/i.test(text)
        ) {

            unknown.push(
                "Some additional qualifications require manual verification, such as personal background, school type, course, or specific academic standing."
            );

        }


        let resultStatus = "Possible Match";

        if (reasons.length > 0) {

            resultStatus = "May Not Qualify";

        } else if (unknown.length > 0) {

            resultStatus = "Needs Verification";

        }


        return {
            key,
            name: data.name || key,
            organization: data.organization || "",
            status: data.status || "Not specified",
            resultStatus,
            reasons,
            unknown
        };

    }


    // =====================================
    // DISPLAY RESULTS
    // =====================================

    function displayResults(matches) {

        const possible = matches.filter(
            item => item.resultStatus === "Possible Match"
        );

        const verification = matches.filter(
            item => item.resultStatus === "Needs Verification"
        );

        const notQualified = matches.filter(
            item => item.resultStatus === "May Not Qualify"
        );

        const orderedResults = [
            ...possible,
            ...verification,
            ...notQualified
        ];


        let html = `

            <div class="eligibility-results-heading">

                <div>
                    <span class="eligibility-eyebrow">YOUR MATCHES</span>

                    <h2>Scholarship Recommendations</h2>

                    <p>
                        Here are the scholarships evaluated using your information.
                    </p>
                </div>

            </div>

            <div class="eligibility-result-summary">

                <div>
                    <strong>${possible.length}</strong>
                    <span>Possible Matches</span>
                </div>

                <div>
                    <strong>${verification.length}</strong>
                    <span>Needs Verification</span>
                </div>

                <div>
                    <strong>${notQualified.length}</strong>
                    <span>May Not Qualify</span>
                </div>

            </div>

            <div class="eligibility-result-list">

        `;


        if (orderedResults.length === 0) {

            html += `
                <div class="eligibility-results-placeholder">
                    <h3>No Scholarships Found</h3>
                    <p>No scholarship records are currently available.</p>
                </div>
            `;

        }


        orderedResults.forEach(item => {

            const reasonsHTML = item.reasons.length
                ? item.reasons.map(reason => `<li>${reason}</li>`).join("")
                : "<li>No definite disqualifying condition was found in the available information.</li>";

            const unknownHTML = item.unknown.length
                ? item.unknown.map(reason => `<li>${reason}</li>`).join("")
                : "";


            html += `

                <article class="eligibility-result-card">

                    <div class="eligibility-result-top">

                        <div>
                            <span class="eligibility-result-category">
                                ${item.organization}
                            </span>

                            <h3>${item.name}</h3>
                        </div>

                        <span class="eligibility-result-badge">
                            ${item.resultStatus}
                        </span>

                    </div>

                    <p class="eligibility-program-status">
                        Application Status: ${item.status}
                    </p>

                    <div class="eligibility-result-reasons">

                        <strong>Evaluation:</strong>

                        <ul>
                            ${reasonsHTML}
                        </ul>

                    </div>

                    ${
                        unknownHTML
                        ? `
                            <div class="eligibility-result-unknown">

                                <strong>Additional Verification:</strong>

                                <ul>
                                    ${unknownHTML}
                                </ul>

                            </div>
                        `
                        : ""
                    }

                    <a href="scholarships.html" class="eligibility-view-btn">
                        View Scholarship Directory
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>

                </article>

            `;

        });


        html += `</div>`;

        resultsSection.innerHTML = html;

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    // =====================================
    // FORM SUBMISSION
    // =====================================

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        if (!form.checkValidity()) {

            form.reportValidity();

            return;

        }

        const student = getStudentInformation();

        const matches = Object.entries(scholarships).map(
            ([key, data]) => evaluateScholarship(key, data, student)
        );

        displayResults(matches);

    });


    // =====================================
    // RESET FORM
    // =====================================

    form.addEventListener("reset", function () {

        setTimeout(function () {

            resultsSection.innerHTML = `

                <div class="eligibility-results-heading">

                    <div>
                        <span class="eligibility-eyebrow">YOUR MATCHES</span>

                        <h2>Scholarship Recommendations</h2>

                        <p>
                            Scholarships that may match your qualifications
                            will appear here.
                        </p>
                    </div>

                </div>

                <div class="eligibility-results-placeholder">

                    <i class="fa-solid fa-file-circle-question"></i>

                    <h3>No Results Yet</h3>

                    <p>
                        Complete the eligibility form and click
                        "Check My Eligibility" to see your results.
                    </p>

                </div>

            `;

        }, 0);

    });

});
