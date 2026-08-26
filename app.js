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

if (modalClose && infoModal) {

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
}

const isOwnerPage = syncStravaButton !== null;
const publicStatusDate = document.getElementById("public-status-date");

//2. STAGES
function getStageContent(stage) {

    return `
        ${stage.content || "<p>Content coming soon.</p>"}

        ${
            stage.video
                ? `
                    <div class="modal-section">
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
}

const stages = [
    {
        name: "Umm Qais",
        startKm: 0,
        latitude: 32.653,
        longitude: 35.684,
        
        content: `
            <section class="waypoint-info">

            <div class="waypoint-section">
                <h3>🏺 A little history</h3>
                <p>
                Your journey begins among the ruins of <strong>Gadara</strong> (former name for Umm Qais),
                an ancient city with more than two thousand years of history beneath its streets.
                Founded during the Hellenistic period, Gadara later became part of the
                <strong>Decapolis</strong>, a group of cities in the eastern Roman world
                strongly influenced by Greek culture. Its position high above the surrounding
                valleys made it both strategically important and spectacularly situated.
                </p>

                <p>
                Under Roman rule, Gadara flourished as a centre of culture and learning.
                The city became associated with philosophers, poets and intellectuals,
                including the poet and philosopher <strong>Meleager of Gadara</strong>.
                Its wealth can still be seen in the remains scattered around Um Qais:
                colonnaded streets, baths, tombs and two theatres. Many were constructed
                from the region's distinctive <strong>black basalt</strong>, giving the
                ruins a very different appearance from the pale limestone cities found
                elsewhere in Jordan.
                </p>

                <p>
                Gadara continued to develop during the <strong>Byzantine period</strong>,
                when churches were built among the older Roman structures. Following the
                Muslim conquest of the region in the seventh century, the settlement became
                part of the emerging Islamic world. A major earthquake in <strong>749 CE</strong>
                contributed to the decline of the ancient city, although people continued
                to live in and around its ruins for centuries.
                </p>

                <p>
                Much later, an Ottoman-era village grew directly over part of ancient
                Gadara. Stone houses were built alongside — and sometimes using material
                from — the much older ruins. Today, Um Qais is therefore not one frozen
                archaeological site, but a place where <strong>Hellenistic, Roman,
                Byzantine, Islamic and Ottoman history</strong> sit almost literally on
                top of one another.
                </p>

                <p>
                And this is where your journey south begins: from the black basalt ruins
                of a Greco-Roman city on Jordan's northern frontier, all the way to the
                Red Sea.
                </p>
            </div>

            <div class="waypoint-section">
                <h3>🗣️ Arabic along the way</h3>

                <div class="arabic-phrase">
                    <p class="arabic">يلا</p>
                    <p><strong>Yalla!</strong></p>
                    <p><em>"Let's go!" / "Come on!"</em></p>
                </div>

                <p>
                    Probably the only appropriate phrase for kilometre zero.
                    You'll hear <em>yalla</em> constantly in Jordan and across
                    the Arabic-speaking world.
                </p>
            </div>

            <div class="waypoint-section">
            <h3>🌿 The landscape</h3>

            <p>
                Forget the image of Jordan as an endless desert, for now. The journey
                begins in the <strong>green hills of northern Jordan</strong>, where the
                landscape has much more in common with the Mediterranean than with the
                deserts you will encounter hundreds of kilometres further south.
            </p>

            <p>
                Um Qais sits on a high ridge above the <strong>Yarmouk River valley</strong>,
                close to Jordan's borders with Syria and Israel. From the plateau, the land
                falls dramatically away toward the Jordan Valley. On a clear day, you can
                look across the <strong>Sea of Galilee</strong> and toward the
                <strong>Golan Heights</strong>. An unusually expansive view that helps
                explain why this hilltop has been strategically important for thousands
                of years.
            </p>

            <p>
                The hills around you form part of Jordan's
                <strong>Mediterranean climatic zone</strong>. Winters here are cooler and
                wetter than in most of the country, allowing grasses, wildflowers, orchards
                and olive groves to cover slopes that can become intensely green during
                winter and spring. By late summer, much of that green has faded into the
                dry gold and ochre of the Mediterranean landscape.
            </p>

            <p>
                Beneath your feet is another clue to the character of the north:
                <strong>dark volcanic basalt</strong>. Ancient lava flows shaped parts of
                this region, and the same black stone appears throughout the ruins of
                Gadara. Here, geology and architecture almost blend into one another —
                Roman streets, theatres and village houses built from the rock of the
                surrounding landscape.
            </p>

            <p>
                As you leave Um Qais, the trail descends through
                <strong>farmland, olive groves and rolling valleys</strong>. Ahead lie the
                wooded highlands of Ajloun, home to some of Jordan's most extensive remaining
                oak and pine forests.
            </p>

            <p>
                Remember this landscape. Over the next <strong>658 kilometres</strong>,
                it will transform almost completely: green Mediterranean hills will give
                way to deep wadis, high plateaus, bare sandstone mountains and eventually
                the vast desert of Wadi Rum.
            </p>
            </div>

            <div class="waypoint-section">
            <h3>🎥 Have a look</h3>

            <iframe
                class="waypoint-video"
                src="https://www.youtube.com/embed/l1AvSQNZrK4?si=R2hTsarxEjQ0_p51"
                title="YouTube video"
                allowfullscreen>
            </iframe>
            </div>

            </section>
            `
    },
    {
        name: "Ziglab Lake",
        startKm: 24.3,
        latitude: 32.526,
        longitude: 35.613,
        image: "images/ziglab.jpg",
        description: "X"
    },
    {
        name: "Rasoun",
        startKm: 61.3,
        latitude: 32.401,
        longitude: 35.758,
        image: "images/rasoun.jpg",
        description: "X"
    },
    {
        name: "Ajloun Castle",
        startKm: 78.1,
        latitude: 32.328,
        longitude: 35.728,
        image: "images/ajloun.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "King Talal Dam",
        startKm: 110,
        latitude: 32.182,
        longitude: 35.797,
        image: "images/king-talal-dam.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "As-Salt",
        startKm: 140.4,
        latitude: 32.038,
        image: "images/as-salt.jpeg",
        longitude: 35.729,

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
        name: "Iraq al-Amir",
        startKm: 162.5,
        latitude: 31.918,
        longitude: 35.752,
        image: "images/iraq al-amir.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Oyoun Al-Theeb",
        startKm: 203.5,
        latitude: 31.718,
        longitude: 35.668,
        image: "images/oyoun al-theeb.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Wadi Zarqa Ma'in",
        startKm: 224.6,
        latitude: 31.601,
        longitude: 35.635,
        image: "images/wadi zarqa main.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Wadi Mujib",
        startKm: 256.8,
        latitude: 31.451,
        longitude: 35.724,
        image: "images/wadi mujib.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Al-Karak",
        startKm: 299.4,
        latitude: 31.182,
        longitude: 35.702,
        image: "images/al-karak.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Tor Al-Taboun",
        startKm: 326.2,
        latitude: 31.008,
        longitude: 35.664,
        image: "images/tor al-taboun.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Ma'tan",
        startKm: 367.8,
        latitude: 30.765,
        longitude: 35.594,
        image: "images/matan.jpg",
        description: "Forested highlands, medieval castles and northern Jordan."
    },
    {
        name: "Dana",
        startKm: 383.3,
        latitude: 30.676,
        longitude: 35.610,
        image: "images/dana.jpg",
        description: "Mountains, biodiversity and one of Jordan's great nature reserves."
    },
    {
        name: "Ras Al-Feid",
        startKm: 420.2,
        latitude: 30.502,
        longitude: 35.484,
        image: "images/ras al-feid.jpg",
        description: "Mountains, biodiversity and one of Jordan's great nature reserves."
    },
    {
        name: "Little Petra",
        startKm: 443,
        latitude: 30.375,
        longitude: 35.452,
        image: "images/little petra.jpeg",
        description: "Mountains, biodiversity and one of Jordan's great nature reserves."
    },
    {
        name: "Petra",
        startKm: 455.6,
        latitude: 30.325,
        longitude: 35.468,
        image: "images/petra.jpg",
        description: "The Nabataean capital, carved into sandstone."
    },
    {
        name: "Wadi Al-Saif",
        startKm: 490.7,
        latitude: 30.183,
        longitude: 35.292,
        image: "images/wadi al-saif.jpg",
        description: "The Nabataean capital, carved into sandstone."
    },
    {
        name: "Wadi Aheimar",
        startKm: 520.8,
        latitude: 30.014,
        longitude: 35.237,
        image: "images/wadi aheimar.jpg",
        description: "The Nabataean capital, carved into sandstone."
    },
    {
        name: "Al-Humeima",
        startKm: 547.2,
        latitude: 29.950,
        longitude: 35.347,
        image: "images/al-humeima.jpg",
        description: "The Nabataean capital, carved into sandstone."
    },
    {
        name: "Jabal Kharazah",
        startKm: 566.1,
        latitude: 29.810,
        longitude: 35.455,
        image: "images/jabal kharazah.jpg",
        description: "The Nabataean capital, carved into sandstone."
    },
    {
        name: "Wadi Rum",
        startKm: 594.1,
        latitude: 29.578,
        longitude: 35.420,
        image: "images/wadi rum.jpg",
        description: "Sandstone mountains, desert landscapes and Bedouin culture."
    },
    {
        name: "Wadi Waraqa",
        startKm: 614.7,
        latitude: 29.426,
        longitude: 35.325,
        image: "images/wadi waraqa.jpg",
        description: "Sandstone mountains, desert landscapes and Bedouin culture."
    },
    {
        name: "Red Sea / Aqaba",
        startKm: 658.4,
        latitude: 29.425,
        longitude: 34.974,
        image: "images/aqaba.jpg",
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

        let marker;

        const isFirstStage = stage === stages[0];
        const isLastStage = stage === stages[stages.length - 1];

        if (isFirstStage) {

            marker = L.marker(
                [stage.latitude, stage.longitude],
                {
                    icon: startIcon
                }
            ).addTo(map);

        } else if (isLastStage) {

            marker = L.marker(
                [stage.latitude, stage.longitude],
                {
                    icon: finishIcon
                }
            ).addTo(map);

        } else {

            marker = L.circleMarker(
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
        }

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

        const tooltipContent = `
            <div class="stage-tooltip-card">

                ${
                    stage.image
                        ? `
                            <div
                                class="stage-tooltip-image"
                                style="background-image: url('${stage.image}')">
                            </div>
                        `
                        : ""
                }

                <div class="stage-tooltip-text">

                    <div class="stage-tooltip-label">
                        ${isUnlocked ? "DISCOVERED" : "🔒 LOCKED WAYPOINT"}
                    </div>

                    <div class="stage-tooltip-name">
                        ${stage.name}
                    </div>

                    <div class="stage-tooltip-distance">
                        km ${stage.startKm}
                    </div>

                    <div class="stage-tooltip-message">
                        ${
                            isUnlocked
                                ? "Click to explore"
                                : "Keep running to discover this place"
                        }
                    </div>

                </div>

            </div>
        `;

        marker.on("mouseover", function () {

            const markerPoint =
                map.latLngToContainerPoint(marker.getLatLng());

            const mapHeight = map.getSize().y;

            let tooltipDirection;
            let tooltipOffset;

            // Marker is in upper half of map:
            // show card underneath
            if (markerPoint.y < mapHeight / 2) {

                tooltipDirection = "bottom";
                tooltipOffset = [0, 10];

            } else {

                // Marker is in lower half:
                // show card above
                tooltipDirection = "top";
                tooltipOffset = [0, -10];
            }

            marker.bindTooltip(
                tooltipContent,
                {
                    direction: tooltipDirection,
                    offset: tooltipOffset,
                    className: "stage-tooltip",
                    opacity: 1
                }
            );

            marker.openTooltip();
        });

        marker.on("mouseout", function () {

            marker.closeTooltip();

        });

    }
}

//2. MAP
let routeData = null;
let runnerMarker = null;
let fullRouteLayer = null;
let completedRouteLayer = null;
let totalRouteDistance = 0;

const map = L.map("map").setView([31, 36.0], 7);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

//2.1 MAP DESIGN
const startIcon = L.icon({
    iconUrl: "images/start.png",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -20]
});

const finishIcon = L.icon({
    iconUrl: "images/finish.png",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -20]
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

// TEMPORARY TESTING 
totalDistance = 4.5;

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

        const latestRun = stravaRuns.length > 0
            ? stravaRuns.reduce(function (latest, run) {
                return new Date(run.date) > new Date(latest.date)
                    ? run
                    : latest;
            })
            : null;

        const response = await fetch(
            "/.netlify/functions/save-progress",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    totalDistance: totalDistance,
                    lastRunDate: latestRun ? latestRun.date : null
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

const lastRunDate = new Date(progress.lastRunDate);

publicStatusDate.textContent =
    "Last run: " +
    lastRunDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short"
    });

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

        if (publicStatusDate && progress.lastRunDate) {

            const lastRunDate = new Date(progress.lastRunDate);

            publicStatusDate.textContent =
                "Last run: " +
                lastRunDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short"
                });

        } else if (publicStatusDate) {

            publicStatusDate.textContent =
                "No runs yet";
        }

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
                ${getStageContent(stage)}
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

    modalBody.innerHTML = getStageContent(stage);

    infoModal.classList.add("is-open");
}