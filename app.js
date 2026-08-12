// ==========================================
// MY HEALTH - APP
// ==========================================

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.getElementById("pageTitle");
const dateElement = document.getElementById("date");


// ==========================================
// DATE
// ==========================================

function updateDate() {

    const now = new Date();

    const date = now.toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    dateElement.textContent =
        date.charAt(0).toUpperCase() + date.slice(1);
}

updateDate();


// ==========================================
// NAVIGATION
// ==========================================

const titles = {
    dashboard: "Dashboard",
    training: "Träning",
    health: "Hälsa",
    sleep: "Sömn",
    analytics: "Analytics"
};


function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active-page");

    });


    const selectedPage =
        document.getElementById(pageName);

    if (selectedPage) {

        selectedPage.classList.add("active-page");

    }


    navItems.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");

        }

    });


    pageTitle.textContent =
        titles[pageName] || "Dashboard";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navItems.forEach(button => {

    button.addEventListener("click", () => {

        showPage(button.dataset.page);

    });

});


document.querySelectorAll("[data-page-link]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.pageLink);

        });

    });


// ==========================================
// DASHBOARD DATA
// ==========================================

function loadDashboard() {

    const today = healthData.today;


    document.getElementById("steps").textContent =
        today.steps.toLocaleString("sv-SE");


    document.getElementById("stepGoal").textContent =
        today.stepGoal.toLocaleString("sv-SE");


    document.getElementById("calories").textContent =
        today.calories.toLocaleString("sv-SE");


    document.getElementById("heartRate").textContent =
        today.restingHeartRate;


    document.getElementById("bodyBattery").textContent =
        today.bodyBattery;


    // STEP PROGRESS

    const stepPercent =
        Math.min(
            (today.steps / today.stepGoal) * 100,
            100
        );

    document.getElementById(
        "stepProgress"
    ).style.width =
        `${stepPercent}%`;


    // CALORIE PROGRESS

    const caloriePercent =
        Math.min(
            (today.calories / today.calorieGoal) * 100,
            100
        );

    document.getElementById(
        "calorieProgress"
    ).style.width =
        `${caloriePercent}%`;


    // BODY BATTERY

    document.getElementById(
        "batteryProgress"
    ).style.width =
        `${today.bodyBattery}%`;
}


// ==========================================
// WORKOUT LIST
// ==========================================

function workoutIcon(type) {

    switch (type) {

        case "Running":
            return "🏃";

        case "Cycling":
            return "🚴";

        case "Strength":
            return "🏋";

        default:
            return "⚡";
    }
}


function renderWorkouts() {

    const container =
        document.getElementById("workoutList");

    container.innerHTML = "";


    healthData.training.workouts
        .slice(0, 4)
        .forEach(workout => {

            const element =
                document.createElement("div");

            element.className = "workout";


            const distance =
                workout.distance > 0
                    ? `${workout.distance} km`
                    : "Styrka";


            element.innerHTML = `

                <div class="workout-left">

                    <div class="workout-icon">

                        ${workoutIcon(workout.type)}

                    </div>

                    <div>

                        <div class="workout-name">

                            ${workout.name}

                        </div>

                        <div class="workout-meta">

                            ${workout.date}
                            ·
                            ${workout.duration} min

                        </div>

                    </div>

                </div>


                <div class="workout-right">

                    <div class="workout-time">

                        ${workout.calories} kcal

                    </div>

                    <div class="workout-distance">

                        ${distance}

                    </div>

                </div>

            `;


            container.appendChild(element);

        });
}


// ==========================================
// ALL TRAINING
// ==========================================

function renderAllWorkouts() {

    const container =
        document.getElementById("allWorkouts");

    container.innerHTML = "";


    healthData.training.workouts
        .forEach(workout => {

            const card =
                document.createElement("div");

            card.className =
                "training-card";


            const distance =
                workout.distance > 0
                    ? `${workout.distance} km`
                    : "—";


            card.innerHTML = `

                <div class="training-card-top">

                    <div>

                        <span class="label">

                            ${workout.type.toUpperCase()}

                        </span>

                        <h3>
                            ${workout.name}
                        </h3>

                        <span class="date">

                            ${workout.date}

                        </span>

                    </div>


                    <div class="workout-icon">

                        ${workoutIcon(workout.type)}

                    </div>

                </div>


                <div class="training-metrics">

                    <div class="training-metric">

                        <span>
                            TID
                        </span>

                        <strong>
                            ${workout.duration} min
                        </strong>

                    </div>


                    <div class="training-metric">

                        <span>
                            DISTANS
                        </span>

                        <strong>
                            ${distance}
                        </strong>

                    </div>


                    <div class="training-metric">

                        <span>
                            KALORIER
                        </span>

                        <strong>
                            ${workout.calories}
                        </strong>

                    </div>

                </div>

            `;


            container.appendChild(card);

        });
}


// ==========================================
// CHART
// ==========================================

let mainChart;


function createChart(dataKey = "trainingLoad") {

    const canvas =
        document.getElementById("mainChart");

    if (!canvas) return;


    if (mainChart) {

        mainChart.destroy();

    }


    const ctx =
        canvas.getContext("2d");


    const data =
        healthData.weekly[dataKey];


    const labels =
        healthData.weekly.labels;


    let label = "Belastning";


    if (dataKey === "steps") {
        label = "Steg";
    }

    if (dataKey === "heartRate") {
        label = "Vilopuls";
    }

    if (dataKey === "calories") {
        label = "Kalorier";
    }


    mainChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: label,

                data: data,

                borderColor: "#8cff4f",

                backgroundColor:
                    "rgba(140,255,79,.08)",

                borderWidth: 2,

                pointBackgroundColor:
                    "#8cff4f",

                pointBorderColor:
                    "#8cff4f",

                pointRadius: 3,

                pointHoverRadius: 6,

                tension: .38,

                fill: true

            }]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            interaction: {

                intersect: false,

                mode: "index"

            },


            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    backgroundColor:
                        "#11161c",

                    borderColor:
                        "#303943",

                    borderWidth: 1,

                    titleColor:
                        "#ffffff",

                    bodyColor:
                        "#8cff4f",

                    padding: 12

                }

            },


            scales: {

                x: {

                    grid: {

                        display: false

                    },

                    ticks: {

                        color: "#697580",

                        font: {

                            size: 10

                        }

                    }

                },


                y: {

                    beginAtZero: false,

                    grid: {

                        color:
                            "rgba(255,255,255,.045)"

                    },

                    ticks: {

                        color: "#697580",

                        font: {

                            size: 9

                        }

                    }

                }

            }

        }

    });

}


// ==========================================
// CHART BUTTONS
// ==========================================

document.querySelectorAll(".chart-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".chart-button")
                .forEach(btn => {

                    btn.classList.remove("active");

                });


            button.classList.add("active");


            createChart(
                button.dataset.chart
            );

        });

    });


// ==========================================
// SYNC
// ==========================================

function syncData() {

    const button =
        document.querySelector(".sync-button");

    if (!button) return;


    button.innerHTML =
        "↻ SYNKAR...";


    button.disabled = true;


    setTimeout(() => {

        button.innerHTML =
            "✓ SYNKAD";


        document.getElementById(
            "lastSync"
        ).textContent =
            "Senast synkad: just nu";


        setTimeout(() => {

            button.innerHTML =
                "↻ SYNKA DATA";

            button.disabled = false;

        }, 1800);

    }, 1200);
}


// ==========================================
// START
// ==========================================

loadDashboard();

renderWorkouts();

renderAllWorkouts();

createChart();


// ==========================================
// CONSOLE
// ==========================================

console.log(
    "MY HEALTH loaded successfully."
);

console.log(
    "Garmin connection:",
    healthData.user.connected
);
