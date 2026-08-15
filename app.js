const API = "http://localhost:5000/api";

let dashboardData = null;
let activities = [];
let dailyData = [];
let sleepData = [];
let hrvData = [];
let weightData = [];


// ============================================================
// HELPERS
// ============================================================

function formatNumber(value) {
    if (value === null || value === undefined) return "—";

    return Number(value).toLocaleString("sv-SE", {
        maximumFractionDigits: 1
    });
}


function formatDistance(value) {
    if (value === null || value === undefined) return "—";

    return Number(value).toFixed(1);
}


function formatSleep(time) {

    if (!time) return "—";

    const parts = time.split(":");

    if (parts.length < 2) return time;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    return `${hours}h ${minutes}m`;
}


function formatDate(dateString) {

    if (!dateString) return "—";

    const date = new Date(dateString);

    if (isNaN(date)) return dateString;

    return date.toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


function formatDuration(time) {

    if (!time) return "—";

    const parts = time.split(":");

    if (parts.length < 2) return time;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}


// ============================================================
// API
// ============================================================

async function fetchAPI(endpoint) {

    const response = await fetch(`${API}${endpoint}`);

    if (!response.ok) {
        throw new Error(
            `API error ${response.status}: ${endpoint}`
        );
    }

    return await response.json();
}


// ============================================================
// LOAD DATA
// ============================================================

async function loadGarminData() {

    try {

        console.log("Hämtar Garmin-data...");

        const [
            dashboard,
            activityData,
            daily,
            sleep,
            hrv,
            weight
        ] = await Promise.all([

            fetchAPI("/dashboard"),

            fetchAPI("/activities"),

            fetchAPI("/daily"),

            fetchAPI("/sleep"),

            fetchAPI("/hrv"),

            fetchAPI("/weight")

        ]);


        dashboardData = dashboard;

        activities = activityData;

        dailyData = daily;

        sleepData = sleep;

        hrvData = hrv;

        weightData = weight;


        updateDashboard();

        updateTraining();

        updateHealth();

        updateSleep();

        updateAnalytics();

        updateLastSync();


        console.log(
            "Garmin-data laddad:",
            dashboardData
        );


    } catch (error) {

        console.error(
            "Kunde inte hämta Garmin-data:",
            error
        );

        showConnectionError();

    }

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    if (!dashboardData) return;


    // STEPS

    const steps =
        dashboardData.steps || 0;

    const stepGoal =
        dashboardData.stepGoal || 0;


    setText(
        "steps",
        formatNumber(steps)
    );


    setText(
        "stepGoal",
        formatNumber(stepGoal)
    );


    if (stepGoal > 0) {

        const percentage =
            Math.min(
                (steps / stepGoal) * 100,
                100
            );

        setWidth(
            "stepProgress",
            percentage
        );

    }


    // CALORIES

    const calories =
        dashboardData.calories || 0;

    const calorieGoal =
        dashboardData.calorieGoal || 0;


    setText(
        "calories",
        formatNumber(calories)
    );


    if (calorieGoal > 0) {

        const percentage =
            Math.min(
                (calories / calorieGoal) * 100,
                100
            );

        setWidth(
            "calorieProgress",
            percentage
        );

    }


    // HEART RATE

    const restingHeartRate =
        dashboardData.restingHeartRate;


    setText(
        "heartRate",
        restingHeartRate ?? "—"
    );


    // BODY BATTERY

    const bodyBattery =
        dashboardData.bodyBattery?.max;


    setText(
        "bodyBattery",
        bodyBattery ?? "—"
    );


    if (bodyBattery !== null &&
        bodyBattery !== undefined) {

        setWidth(
            "batteryProgress",
            bodyBattery
        );

    }


    // DATE

    setText(
        "date",
        formatDate(dashboardData.date)
    );


    // BODY STATUS

    updateBodyStatus();

    // RECENT WORKOUTS

    renderRecentWorkouts();

}


// ============================================================
// BODY STATUS
// ============================================================

function updateBodyStatus() {

    const bodyStats =
        document.querySelectorAll(".body-stat strong");


    if (bodyStats.length >= 4) {

        bodyStats[0].innerHTML =
            `${dashboardData.restingHeartRate ?? "—"} <em>bpm</em>`;


        const latestHRV =
            hrvData.length
                ? hrvData[0].hrv
                : null;


        bodyStats[1].innerHTML =
            `${latestHRV ?? "—"} <em>ms</em>`;


        bodyStats[2].innerHTML =
            `${dashboardData.bodyBattery?.max ?? "—"} <em>%</em>`;


        bodyStats[3].innerHTML =
            `${dashboardData.stress ?? "—"}`;

    }

}


// ============================================================
// RECENT WORKOUTS
// ============================================================

function renderRecentWorkouts() {

    const container =
        document.getElementById("workoutList");

    if (!container) return;


    container.innerHTML = "";


    const recent =
        activities.slice(0, 5);


    if (!recent.length) {

        container.innerHTML =
            `<p>Inga träningspass hittades.</p>`;

        return;

    }


    recent.forEach(activity => {

        const div =
            document.createElement("div");

        div.className =
            "workout-item";


        const sport =
            activity.sport || "Träning";


        const name =
            activity.name || sport;


        div.innerHTML = `

            <div class="workout-icon">
                ${getSportIcon(sport)}
            </div>

            <div class="workout-info">

                <strong>
                    ${escapeHTML(name)}
                </strong>

                <small>
                    ${formatDate(activity.start_time)}
                </small>

            </div>

            <div class="workout-data">

                <strong>
                    ${formatDuration(activity.elapsed_time)}
                </strong>

                <small>
                    ${formatNumber(activity.calories)} kcal
                </small>

            </div>

        `;


        container.appendChild(div);

    });

}


// ============================================================
// TRAINING PAGE
// ============================================================

function updateTraining() {

    const container =
        document.getElementById("allWorkouts");

    if (!container) return;


    container.innerHTML = "";


    activities.forEach(activity => {

        const card =
            document.createElement("div");

        card.className =
            "training-card";


        card.innerHTML = `

            <div class="training-card-top">

                <div class="training-icon">
                    ${getSportIcon(activity.sport)}
                </div>

                <span>
                    ${formatDate(activity.start_time)}
                </span>

            </div>

            <h3>
                ${escapeHTML(
                    activity.name ||
                    activity.sport ||
                    "Träning"
                )}
            </h3>

            <div class="training-metrics">

                <div>
                    <small>TID</small>
                    <strong>
                        ${formatDuration(
                            activity.elapsed_time
                        )}
                    </strong>
                </div>

                <div>
                    <small>KALORIER</small>
                    <strong>
                        ${formatNumber(
                            activity.calories
                        )}
                    </strong>
                </div>

                <div>
                    <small>PULS</small>
                    <strong>
                        ${activity.avg_hr ?? "—"}
                    </strong>
                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


// ============================================================
// HEALTH PAGE
// ============================================================

function updateHealth() {

    const cards =
        document.querySelectorAll(
            "#health .big-health-card"
        );


    if (cards.length < 4) return;


    const resting =
        dashboardData.restingHeartRate;


    cards[0].querySelector(
        "strong"
    ).innerHTML =
        `${resting ?? "—"} <small>bpm</small>`;


    const latestHRV =
        hrvData.length
            ? hrvData[0].hrv
            : null;


    cards[1].querySelector(
        "strong"
    ).innerHTML =
        `${latestHRV ?? "—"} <small>ms</small>`;


    cards[2].querySelector(
        "strong"
    ).textContent =
        dashboardData.stress ?? "—";


    const battery =
        dashboardData.bodyBattery?.max;


    cards[3].querySelector(
        "strong"
    ).textContent =
        battery !== null &&
        battery !== undefined
            ? `${battery}%`
            : "—";


    const batteryBar =
        cards[3].querySelector(
            ".battery-level"
        );


    if (batteryBar && battery != null) {

        batteryBar.style.width =
            `${battery}%`;

    }

}


// ============================================================
// SLEEP PAGE
// ============================================================

function updateSleep() {

    if (!dashboardData?.sleep) return;


    const sleep =
        dashboardData.sleep;


    const sleepScore =
        document.querySelector(
            ".sleep-score strong"
        );


    if (sleepScore) {

        sleepScore.textContent =
            sleep.score ?? "—";

    }


    const sleepTime =
        document.querySelector(
            ".sleep-time strong"
        );


    if (sleepTime) {

        sleepTime.textContent =
            formatSleep(sleep.total);

    }


    const stages =
        document.querySelectorAll(
            ".sleep-stages div strong"
        );


    if (stages.length >= 3) {

        stages[0].textContent =
            formatSleep(sleep.deep);


        stages[1].textContent =
            formatSleep(sleep.rem);


        stages[2].textContent =
            formatSleep(sleep.light);

    }

}


// ============================================================
// ANALYTICS
// ============================================================

function updateAnalytics() {

    if (!dailyData.length) return;


    const latest =
        dailyData[0];


    const cards =
        document.querySelectorAll(
            ".analytics-card"
        );


    if (cards.length >= 4) {

        cards[1].querySelector(
            "strong"
        ).textContent =
            formatNumber(
                latest.steps
            );


        cards[2].querySelector(
            "strong"
        ).textContent =
            dashboardData.sleep?.total
                ? formatSleep(
                    dashboardData.sleep.total
                )
                : "—";


        cards[3].querySelector(
            "strong"
        ).textContent =
            activities.length;

    }

}


// ============================================================
// CHART
// ============================================================

let mainChart = null;


function createChart() {

    const canvas =
        document.getElementById(
            "mainChart"
        );


    if (!canvas) return;


    const labels =
        dailyData
            .slice(0, 14)
            .reverse()
            .map(item =>
                new Date(
                    item.day
                ).toLocaleDateString(
                    "sv-SE",
                    {
                        day: "numeric",
                        month: "short"
                    }
                )
            );


    const values =
        dailyData
            .slice(0, 14)
            .reverse()
            .map(item =>
                item.steps || 0
            );


    mainChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels,

                datasets: [{

                    label: "Steg",

                    data: values,

                    borderWidth: 2,

                    tension: 0.35,

                    fill: true

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {
                        beginAtZero: true
                    }

                }

            }

        });

}


// ============================================================
// SYNC
// ============================================================

async function syncData() {

    const button =
        document.querySelector(
            ".sync-button"
        );


    if (button) {

        button.disabled = true;

        button.innerHTML =
            `<span>↻</span> SYNKAR...`;

    }


    await loadGarminData();


    if (button) {

        button.disabled = false;

        button.innerHTML =
            `<span>↻</span> SYNKA DATA`;

    }

}


// ============================================================
// LAST SYNC
// ============================================================

function updateLastSync() {

    const element =
        document.getElementById(
            "lastSync"
        );


    if (!element) return;


    const now =
        new Date();


    element.textContent =
        "Senast synkad: " +
        now.toLocaleTimeString(
            "sv-SE",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


// ============================================================
// CONNECTION ERROR
// ============================================================

function showConnectionError() {

    console.error(
        "Garmin API kunde inte nås."
    );


    const status =
        document.querySelector(
            ".garmin-status small"
        );


    if (status) {

        status.innerHTML =
            `<i></i> API offline`;

    }

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    const pages =
        document.querySelectorAll(
            ".page"
        );


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;


                navItems.forEach(
                    n =>
                        n.classList.remove(
                            "active"
                        )
                );


                item.classList.add(
                    "active"
                );


                pages.forEach(
                    p =>
                        p.classList.remove(
                            "active-page"
                        )
                );


                const target =
                    document.getElementById(
                        page
                    );


                if (target) {

                    target.classList.add(
                        "active-page"
                    );

                }


                const title =
                    item.textContent
                        .trim();


                setText(
                    "pageTitle",
                    title
                );

            }
        );

    });


    document.querySelectorAll(
        "[data-page-link]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.pageLink;


                const nav =
                    document.querySelector(
                        `[data-page="${page}"]`
                    );


                if (nav) nav.click();

            }
        );

    });

}


// ============================================================
// CHART BUTTONS
// ============================================================

function setupChartButtons() {

    document.querySelectorAll(
        ".chart-button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document.querySelectorAll(
                    ".chart-button"
                ).forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                updateMainChart(
                    button.dataset.chart
                );

            }
        );

    });

}


function updateMainChart(type) {

    if (!mainChart) return;


    let values = [];


    const recent =
        dailyData
            .slice(0, 14)
            .reverse();


    if (type === "steps") {

        values =
            recent.map(
                x => x.steps || 0
            );

    }

    else if (type === "calories") {

        values =
            recent.map(
                x => x.calories_total || 0
            );

    }

    else if (type === "heartRate") {

        values =
            recent.map(
                x => x.rhr || 0
            );

    }

    else {

        values =
            recent.map(
                x => x.stress_avg || 0
            );

    }


    mainChart.data.datasets[0].data =
        values;


    mainChart.data.datasets[0].label =
        type;


    mainChart.update();

}


// ============================================================
// UTILITIES
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function setWidth(id, percentage) {

    const element =
        document.getElementById(id);

    if (element) {

        element.style.width =
            `${percentage}%`;

    }

}


function getSportIcon(sport) {

    if (!sport) return "◈";


    sport =
        sport.toLowerCase();


    if (sport.includes("running")) return "🏃";

    if (sport.includes("cycling")) return "🚴";

    if (sport.includes("swimming")) return "🏊";

    if (sport.includes("walking")) return "🚶";

    if (sport.includes("fitness")) return "🏋️";

    if (sport.includes("strength")) return "🏋️";


    return "◈";

}


function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupNavigation();

        setupChartButtons();

        await loadGarminData();

        createChart();

    }
);
