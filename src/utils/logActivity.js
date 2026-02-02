import supabase from "../config/supabaseClient";

/**
 * Logs an activity to the activity_logs table.
 * @param {string} action - The type of action (e.g., 'USER_UPDATE', 'POLICY_CREATE')
 * @param {string} details - Human-readable details about the action
 */
export const logActivity = async (action, details) => {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            console.warn("Cannot log activity: No active session");
            return;
        }

        const { error } = await supabase.from("activity_logs").insert([
            {
                action,
                details,
                performed_by: session.user.id,
            },
        ]);

        if (error) {
            console.error("Error logging activity:", error.message);
        }
    } catch (err) {
        console.error("Unexpected error logging activity:", err);
    }
};
