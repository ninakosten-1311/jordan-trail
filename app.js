//1. LOADING
const syncStravaButton = document.getElementById("sync-strava-button");
const distanceDisplay = document.getElementById("distance-display");
const stageName = document.getElementById("stage-name");
const stageDistance = document.getElementById("stage-distance");
const nextStageDisplay = document.getElementById("next-stage");
const percentageDisplay = document.getElementById("percentage-display");
const progressFill = document.getElementById("progress-fill");

const infoModal = document.getElementById("info-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

//2. STAGES
const stages = [
    {
        name: "Umm Qais",
        startKm: 0,
        latitude: 32.653,
        longitude: 35.684,
        description: "Your Jordan Trail begins here."
    },
    {
        name: "Ajloun",
        startKm: 80,
        latitude: 32.333,
        longitude: 35.752,
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "As-Salt",
        startKm: 160,
        latitude: 32.039,
        longitude: 35.727,

        description:
            "Ottoman-era architecture and an important historic town.",

        etymology:
            "The name Salt is thought to relate to the older Semitic name of the settlement...",

        culture:
            "As-Salt developed as an important regional trading and administrative centre...",

        religion:
            "The city has a long history of Muslim and Christian communities living alongside one another...",

        history:
            "As-Salt became especially important during the late Ottoman period...",

        video:
            "https://www.youtube.com/embed/VIDEO_ID"
    },
    {
        name: "Wadi Mujib",
        startKm: 260,
        description: "A dramatic canyon landscape near the Dead Sea."
    },
    {
        name: "Dana",
        startKm: 380,
        description: "Mountains, biodiversity and one of Jordan's great nature reserves."
    },
    {
        name: "Petra",
        startKm: 470,
        description: "The Nabataean capital, carved into sandstone."
    },
    {
        name: "Wadi Rum",
        startKm: 560,
        description: "Sandstone mountains, desert landscapes and Bedouin culture."
    },
    {
        name: "Aqaba",
        startKm: 650,
        description: "The final stretch reaches the Red Sea."
    }
];

function addStageMarkers() {

    for (const stage of stages) {

        if (
            stage.latitude === undefined ||
            stage.longitude === undefined
        ) {
            continue;
        }

        const marker = L.circleMarker(
            [stage.latitude, stage.longitude],
            {
                radius: 6,
                color: "#A84B32",
                fillColor: "#F6EEDF",
                fillOpacity: 1,
                weight: 2
            }
        ).addTo(map);

        marker.on("click", function () {
            openStageModal(stage);
        });

        marker.bindTooltip(
            stage.name + " · km " + stage.startKm,
            {
                direction: "top",
                offset: [0, -6]
            }
        );

    }
}

//2. MAP
let routeData = null;
let runnerMarker = null;
let fullRouteLayer = null;
let completedRouteLayer = null;

const map = L.map("map").setView([31.5, 36.0], 7);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

//1.2 MAP ICONS
const startIcon = L.icon({
    iconUrl: "images/start.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const finishIcon = L.icon({
    iconUrl: "images/finish.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const ummQais = [32.653, 35.684];
const aqaba = [29.532, 35.006];
L.marker(ummQais, { icon: startIcon })
    .addTo(map)
    .bindPopup("🏁 Umm Qais — Start");
L.marker(aqaba, { icon: finishIcon })
    .addTo(map)
    .bindPopup("🌊 Aqaba — Finish");

fetch("data/jordan-trail.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        routeData = data;

        fullRouteLayer = L.geoJSON(data, {
            style: {
                color: "#9B8D7A",
                weight: 4
            }
        }).addTo(map);

        updateRunnerPosition();
        updateCompletedRoute();
        updateCurrentStage();
        addStageMarkers();

    });

function updateRunnerPosition() {

    if (routeData === null) {
        return;
    }

    let distanceLeft = totalDistance;

    for (const feature of routeData.features) {

        const lines = feature.geometry.coordinates;

        for (const coordinates of lines) {

            const line = turf.lineString(coordinates);

            const lineLength = turf.length(line, {
                units: "kilometers"
            });

            if (distanceLeft <= lineLength) {

                const position = turf.along(line, distanceLeft, {
                    units: "kilometers"
                });

                const longitude = position.geometry.coordinates[0];
                const latitude = position.geometry.coordinates[1];

                if (runnerMarker === null) {

                    runnerMarker = L.marker([latitude, longitude], {
                        icon: runnerIcon
                    })
                        .addTo(map)
                        .bindPopup("🏃 You are here!");

                } else {

                    runnerMarker.setLatLng([latitude, longitude]);
                }
                return;
            }
            distanceLeft = distanceLeft - lineLength;
        }
    }
}

const runnerIcon = L.icon({
    iconUrl: "images/runner.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

//2.RUNS
const challengeStartDate = new Date("2026-08-24");
let stravaRuns =
    JSON.parse(localStorage.getItem("stravaRuns")) || [];

let totalDistance = 0;

for (const run of stravaRuns) {
    totalDistance = totalDistance + run.distanceKm;
}

updateProgressDisplay();

async function syncStravaRuns() {

    syncStravaButton.textContent = "↻ Syncing...";

    try {

        const response = await fetch(
            "/.netlify/functions/strava-runs"
        );

        if (!response.ok) {
            throw new Error("Could not load Strava runs");
        }

        const fetchedRuns = await response.json();

        const eligibleRuns = fetchedRuns.filter(function (run) {

            const runDate = new Date(run.date);

            const alreadyImported = stravaRuns.some(function (savedRun) {
                return savedRun.id === run.id;
            });

            return (
                runDate >= challengeStartDate &&
                !alreadyImported
            );
        });

        if (eligibleRuns.length === 0) {
            alert("No new Strava runs available.");
            return;
        }

        const choiceText = eligibleRuns
            .map(function (run, index) {

                return (
                    (index + 1) +
                    ". " +
                    run.name +
                    " — " +
                    run.distanceKm.toFixed(1) +
                    " km"
                );
            })
            .join("\n");

        const choice = prompt(
            "Which run do you want to add?\n\n" +
            choiceText
        );

        if (choice === null) {
            return;
        }

        const selectedIndex = Number(choice) - 1;

        if (
            selectedIndex < 0 ||
            selectedIndex >= eligibleRuns.length
        ) {
            alert("Please choose a valid run.");
            return;
        }

        const selectedRun = eligibleRuns[selectedIndex];

        stravaRuns.push(selectedRun);

        localStorage.setItem(
            "stravaRuns",
            JSON.stringify(stravaRuns)
        );

        recalculateTotalDistance();

        updateProgressDisplay();
        updateRunnerPosition();
        updateCompletedRoute();
        updateCurrentStage();

        alert(
            selectedRun.name +
            " added: " +
            selectedRun.distanceKm.toFixed(1) +
            " km"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while loading Strava."
        );

    } finally {

        syncStravaButton.textContent = "↻ Sync run";
    }
}

syncStravaButton.addEventListener(
    "click",
    syncStravaRuns
);

function recalculateTotalDistance() {

    totalDistance = 0;

    for (const run of stravaRuns) {
        totalDistance = totalDistance + run.distanceKm;
    }
}

function updateProgressDisplay() {

    distanceDisplay.textContent = totalDistance.toFixed(1) + " / 675 km";

    const percentage = (totalDistance / 675) * 100;

    percentageDisplay.textContent = percentage.toFixed(1) + "%";

    progressFill.style.width = percentage + "%";
}

function updateCompletedRoute() {

        if (routeData === null) {
            return;
        }

    let distanceLeft = totalDistance;
    let completedLines = [];

    for (const feature of routeData.features) {

        if (distanceLeft <= 0) {
            break;
        }

        const lines = feature.geometry.coordinates;

        for (const coordinates of lines) {

            if (distanceLeft <= 0) {
                break;
            }
        
            const line = turf.lineString(coordinates);

            const lineLength = turf.length(line, {
                units: "kilometers"
            });

            if (distanceLeft >= lineLength) {

            completedLines.push(line);

            distanceLeft = distanceLeft - lineLength;

            } 
            
            else {

                const partialLine = turf.lineSliceAlong(
                    line,
                    0,
                    distanceLeft,
                    {
                        units: "kilometers"
                    }
                );

                completedLines.push(partialLine);

                distanceLeft = 0;

                break;

            }
        }
    }

    const completedCollection = turf.featureCollection(completedLines);

if (completedRouteLayer !== null) {
    map.removeLayer(completedRouteLayer);
}

completedRouteLayer = L.geoJSON(completedCollection, {
    style: {
        color: "#A84B32",
        weight: 5
    }
}).addTo(map);
}

function updateCurrentStage() {

    let currentStage = stages[0];
    let nextStage = null;

    for (let i = 0; i < stages.length; i++) {

        if (totalDistance >= stages[i].startKm) {
            currentStage = stages[i];
        } else {
            nextStage = stages[i];
            break;
        }
    }

    stageName.textContent = currentStage.name;
    stageDistance.textContent = currentStage.description;

    if (nextStage !== null) {

        const distanceToNext = nextStage.startKm - totalDistance;

        nextStageDisplay.textContent =
            nextStage.name + " · " +
            distanceToNext.toFixed(1) + " km to go";

    } else {

        nextStageDisplay.textContent = "Journey complete";
    }
}

// STAGE EDUCATION

function openStageModal(stage) {

    modalTitle.textContent = stage.name;

    modalBody.innerHTML = `
        <p>${stage.description || ""}</p>

        <div class="modal-section">
            <h3>Etymology</h3>
            <p>${stage.etymology || "Content coming soon."}</p>
        </div>

        <div class="modal-section">
            <h3>History</h3>
            <p>${stage.history || "Content coming soon."}</p>
        </div>

        <div class="modal-section">
            <h3>Culture</h3>
            <p>${stage.culture || "Content coming soon."}</p>
        </div>

        <div class="modal-section">
            <h3>Religion</h3>
            <p>${stage.religion || "Content coming soon."}</p>
        </div>

        ${
            stage.video
                ? `
                <div class="modal-section">
                    <h3>Watch</h3>

                    <iframe
                        class="modal-video"
                        src="${stage.video}"
                        allowfullscreen>
                    </iframe>
                </div>
                `
                : ""
        }
    `;

    infoModal.classList.add("is-open");
}

modalClose.addEventListener("click", function () {
    infoModal.classList.remove("is-open");
});

infoModal.addEventListener("click", function (event) {

    if (event.target === infoModal) {
        infoModal.classList.remove("is-open");
    }

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        infoModal.classList.remove("is-open");
    }

});