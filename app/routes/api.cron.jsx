import { data } from "react-router";
import db from "../db.server";

export async function loader({ request }) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return data({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await db.shopSettings.updateMany({
            where: {
                lastCreditResetAt: { lte: thirtyDaysAgo },
            },
            data: {
                pageCredits: 20,
                iterationTokens: 100,
                lastCreditResetAt: new Date(),
            },
        });

        return data({ success: true, count: result.count });

    } catch (error) {
        return data({ success: false, error: error.message }, { status: 500 });
    }
}