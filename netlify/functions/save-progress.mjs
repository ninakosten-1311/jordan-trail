import { getStore } from "@netlify/blobs";

export default async function (request) {

    try {

        const body = await request.json();

        const totalDistance = Number(body.totalDistance);

        if (
            !Number.isFinite(totalDistance) ||
            totalDistance < 0
        ) {
            return Response.json(
                {
                    error: "Invalid total distance"
                },
                { status: 400 }
            );
        }

        const store = getStore("journey-progress");

        await store.setJSON(
            "jordan",
            {
                totalDistance: totalDistance,
                updatedAt: new Date().toISOString()
            }
        );

        return Response.json({
            success: true,
            totalDistance: totalDistance
        });

    } catch (error) {

        console.error(error);

        return Response.json(
            {
                error: "Could not save progress"
            },
            { status: 500 }
        );
    }
}
