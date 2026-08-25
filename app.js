//1. LOADING
const syncStravaButton = document.getElementById("sync-strava-button");
const distanceDisplay = document.getElementById("distance-display");
const stageName = document.getElementById("stage-name");
const nextStageDistance = document.getElementById("next-stage-distance");
const stageLockMessage = document.getElementById("stage-lock-message");
const stageImage = document.getElementById("stage-image");
const percentageDisplay = document.getElementById("percentage-display");
const progressFill = document.getElementById("progress-fill");
const unlockedWaypoints = document.getElementById("unlocked-waypoints");
const infoModal = document.getElementById("info-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const isOwnerPage = syncStravaButton !== null;

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
        image: "images/ajloun.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "As-Salt",
        startKm: 160,
        latitude: 32.039,
        image: "images/as-salt.jpeg",
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

        const isUnlocked = totalDistance >= stage.startKm;

        const marker = L.circleMarker(
            [stage.latitude, stage.longitude],
            {
                radius: 6,

                color: isUnlocked
                    ? "#A84B32"
                    : "#8D877B",

                fillColor: isUnlocked
                    ? "#F6EEDF"
                    : "#C9C3B7",

                fillOpacity: 1,
                weight: 2
            }
        ).addTo(map);

        marker.on("click", function () {

            if (totalDistance >= stage.startKm) {

                openStageModal(stage);

            } else {

                alert(
                    stage.name +
                    " unlocks at km " +
                    stage.startKm
                );
            }
        });

        marker.bindTooltip(
            isUnlocked
                ? stage.name + " · km " + stage.startKm
                : "🔒 " + stage.name + " · km " + stage.startKm,
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
let totalRouteDistance = 0;

const map = L.map("map").setView([31.5, 36.0], 7);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

//2.1 MAP DESIGN
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

const runnerIcon = L.icon({
    iconUrl: "images/runner.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

function orderRouteSegments(data) {

    let segments = [];

    // Collect every LineString from the GeoJSON
    for (const feature of data.features) {

        if (feature.geometry.type === "LineString") {

            segments.push(
                feature.geometry.coordinates
            );

        } else if (feature.geometry.type === "MultiLineString") {

            for (const line of feature.geometry.coordinates) {
                segments.push(line);
            }
        }
    }

    // Umm Qais, [longitude, latitude]
    const trailStart = [35.684, 32.653];

    // Find the segment whose endpoint is closest to Umm Qais
    let startIndex = 0;
    let startReverse = false;
    let shortestDistance = Infinity;

    for (let i = 0; i < segments.length; i++) {

        const first = segments[i][0];
        const last = segments[i][segments[i].length - 1];

        const distanceToFirst = turf.distance(
            turf.point(trailStart),
            turf.point(first),
            { units: "kilometers" }
        );

        const distanceToLast = turf.distance(
            turf.point(trailStart),
            turf.point(last),
            { units: "kilometers" }
        );

        if (distanceToFirst < shortestDistance) {
            shortestDistance = distanceToFirst;
            startIndex = i;
            startReverse = false;
        }

        if (distanceToLast < shortestDistance) {
            shortestDistance = distanceToLast;
            startIndex = i;
            startReverse = true;
        }
    }

    let firstSegment = segments.splice(startIndex, 1)[0];

    if (startReverse) {
        firstSegment.reverse();
    }

    const orderedSegments = [firstSegment];

    // Keep finding the geographically nearest next segment
    while (segments.length > 0) {

        const currentSegment =
            orderedSegments[orderedSegments.length - 1];

        const currentEnd =
            currentSegment[currentSegment.length - 1];

        let bestIndex = 0;
        let bestReverse = false;
        let bestDistance = Infinity;

        for (let i = 0; i < segments.length; i++) {

            const first = segments[i][0];
            const last = segments[i][segments[i].length - 1];

            const distanceToFirst = turf.distance(
                turf.point(currentEnd),
                turf.point(first),
                { units: "kilometers" }
            );

            const distanceToLast = turf.distance(
                turf.point(currentEnd),
                turf.point(last),
                { units: "kilometers" }
            );

            if (distanceToFirst < bestDistance) {
                bestDistance = distanceToFirst;
                bestIndex = i;
                bestReverse = false;
            }

            if (distanceToLast < bestDistance) {
                bestDistance = distanceToLast;
                bestIndex = i;
                bestReverse = true;
            }
        }

        let nextSegment = segments.splice(bestIndex, 1)[0];

        if (bestReverse) {
            nextSegment.reverse();
        }

        console.log(
            "Connecting next trail segment. Gap:",
            bestDistance.toFixed(3),
            "km"
        );

        orderedSegments.push(nextSegment);
    }

    // Turn the ordered lines back into the format your existing code expects
    return turf.featureCollection([
        turf.multiLineString(orderedSegments)
    ]);
}

fetch("data/jordan-trail.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        routeData = orderRouteSegments(data);

        totalRouteDistance = 0;

        for (const feature of routeData.features) {

            const lines = feature.geometry.coordinates;

            for (const coordinates of lines) {

                const line = turf.lineString(coordinates);

                totalRouteDistance =
                    totalRouteDistance +
                    turf.length(line, {
                        units: "kilometers"
                    });
            }
        }
    
        updateProgressDisplay();

    // START MARKER

    const firstFeature = routeData.features[0];
    const firstLine = firstFeature.geometry.coordinates[0];

    const startLongitude = firstLine[0][0];
    const startLatitude = firstLine[0][1];

    L.marker(
        [startLatitude, startLongitude],
        { icon: startIcon }
    )
        .addTo(map)
        .bindPopup("🏁 Jordan Trail — Start");


    // FINISH MARKER

    const lastFeature =
        routeData.features[routeData.features.length - 1];

    const lastLines =
        lastFeature.geometry.coordinates;

    const lastLine =
        lastLines[lastLines.length - 1];

    const lastCoordinate =
        lastLine[lastLine.length - 1];

    const finishLongitude = lastCoordinate[0];
    const finishLatitude = lastCoordinate[1];

    L.marker(
        [finishLatitude, finishLongitude],
        { icon: finishIcon }
    )
        .addTo(map)
        .bindPopup("🌊 Aqaba — Finish");


    fullRouteLayer = L.geoJSON(routeData, {
        style: {
            color: "#9B8D7A",
            weight: 4
        }
    }).addTo(map);

    if (isOwnerPage) {

        updateRunnerPosition();
        updateCompletedRoute();
        updateCurrentStage();
        addStageMarkers();
        updateUnlockedWaypoints();

        publishProgress();

    } else {

        loadPublishedProgress();
        addStageMarkers();

    }
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

//2.RUNS
const challengeStartDate = new Date("2026-08-24");
let stravaRuns =
    JSON.parse(localStorage.getItem("stravaRuns")) || [];

let totalDistance = 0;

for (const run of stravaRuns) {
    totalDistance = totalDistance + run.distanceKm;
}

// TEMPORARY TESTING totalDistance = 80;

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
        updateUnlockedWaypoints();

        await publishProgress();

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

if (syncStravaButton) {

    syncStravaButton.addEventListener(
        "click",
        syncStravaRuns
    );

}

async function publishProgress() {

    try {

        const response = await fetch(
            "/.netlify/functions/save-progress",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    totalDistance: totalDistance
                })
            }
        );

        if (!response.ok) {
            throw new Error("Could not publish progress");
        }

        const result = await response.json();

        console.log(
            "Progress published:",
            result.totalDistance
        );

    } catch (error) {

        console.error(
            "Could not publish progress:",
            error
        );
    }
}

async function loadPublishedProgress() {

    try {

        const response = await fetch(
            "/.netlify/functions/get-progress"
        );

        if (!response.ok) {
            throw new Error("Could not load published progress");
        }

        const progress = await response.json();

        totalDistance = Number(progress.totalDistance) || 0;

        updateProgressDisplay();
        updateRunnerPosition();
        updateCompletedRoute();
        updateCurrentStage();
        updateUnlockedWaypoints();

    } catch (error) {

        console.error(
            "Could not load published progress:",
            error
        );
    }
}

function recalculateTotalDistance() {

    totalDistance = 0;

    for (const run of stravaRuns) {
        totalDistance = totalDistance + run.distanceKm;
    }
}

function updateUnlockedWaypoints() {

    unlockedWaypoints.innerHTML = "";

    const unlockedStages = stages.filter(function (stage) {
        return totalDistance >= stage.startKm;
    });

    for (const stage of unlockedStages) {

        const card = document.createElement("div");
        card.className = "unlocked-stage-card";

        card.innerHTML = `
            <button class="unlocked-stage-header">

                <div>
                    <p class="unlocked-stage-label">
                        DISCOVERED WAYPOINT
                    </p>

                    <h2>${stage.name}</h2>
                </div>

                <span class="unlocked-stage-arrow">⌄</span>

            </button>

            <div class="unlocked-stage-content">

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

            </div>
        `;

        const header =
            card.querySelector(".unlocked-stage-header");

        header.addEventListener("click", function () {
            card.classList.toggle("is-open");
        });

        unlockedWaypoints.appendChild(card);
    }
}

function updateProgressDisplay() {

    if (totalRouteDistance === 0) {
        return;
    }

    distanceDisplay.textContent =
        totalDistance.toFixed(1) +
        " / " +
        totalRouteDistance.toFixed(1) +
        " km";

    const percentage =
        (totalDistance / totalRouteDistance) * 100;

    percentageDisplay.textContent =
        percentage.toFixed(1) + "%";

    progressFill.style.width =
        percentage + "%";
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

    let nextStage = null;

    for (const stage of stages) {

        if (totalDistance < stage.startKm) {
            nextStage = stage;
            break;
        }
    }

    if (nextStage !== null) {

        const distanceToNext =
            nextStage.startKm - totalDistance;

        stageName.textContent =
            nextStage.name;

        nextStageDistance.textContent =
            distanceToNext.toFixed(1) + " km to go";

        stageLockMessage.textContent =
            "🔒 Reach " +
            nextStage.name +
            " to discover this waypoint";

        if (nextStage.image) {
            stageImage.style.backgroundImage =
                `url("${nextStage.image}")`;
        }

    } else {

        stageName.textContent = "Journey complete";

        nextStageDistance.textContent = "";

        stageLockMessage.textContent =
            "You reached the final waypoint.";

        stageImage.style.backgroundImage = "";
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