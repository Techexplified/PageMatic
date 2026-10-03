import { data } from "react-router";
import db from "../db.server";

export async function loader({ request }) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return data({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const result = await db.shopSettings.updateMany({
            where: {
                lastCreditResetAt: { lte: sevenDaysAgo },
            },
            data: {
                pageCredits: 50,
                iterationTokens: 200,
                lastCreditResetAt: new Date(),
            },
        });

        return data({ success: true, count: result.count });

    } catch (error) {
        return data({ success: false, error: error.message }, { status: 500 });
    }
}