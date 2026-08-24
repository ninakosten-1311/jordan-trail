export default async function () {
    try {
        const tokenResponse = await fetch(
            "https://www.strava.com/oauth/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: process.env.STRAVA_CLIENT_ID,
                    client_secret: process.env.STRAVA_CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: process.env.STRAVA_REFRESH_TOKEN
                })
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return Response.json(
                {
                    error: "Could not refresh Strava token",
                    details: tokenData
                },
                { status: 500 }
            );
        }

        const activitiesResponse = await fetch(
            "https://www.strava.com/api/v3/athlete/activities?per_page=100",
            {
                headers: {
                    Authorization: "Bearer " + tokenData.access_token
                }
            }
        );

        const activities = await activitiesResponse.json();

        if (!activitiesResponse.ok) {
            return Response.json(
                {
                    error: "Could not fetch Strava activities",
                    details: activities
                },
                { status: 500 }
            );
        }

        const runs = activities
            .filter(function (activity) {
                return activity.sport_type === "Run";
            })
            .map(function (activity) {
                return {
                    id: activity.id,
                    name: activity.name,
                    distanceKm: activity.distance / 1000,
                    date: activity.start_date_local
                };
            });

        return Response.json(runs);

    } catch (error) {
        return Response.json(
            {
                error: "Unexpected server error"
            },
            { status: 500 }
        );
    }
}
