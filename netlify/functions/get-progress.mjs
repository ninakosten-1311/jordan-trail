import { getStore } from "@netlify/blobs";

export default async function () {

    try {

        const store = getStore("journey-progress");

        const progress = await store.get(
            "jordan",
            {
                type: "json"
            }
        );

        if (!progress) {

            return Response.json({
                totalDistance: 0,
                updatedAt: null
            });
        }

        return Response.json(progress);

    } catch (error) {

        console.error(error);

        return Response.json(
            {
                error: "Could not load progress"
            },
            { status: 500 }
        );
    }
}
