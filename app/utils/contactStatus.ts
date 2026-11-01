export type ContactStatus = "green" | "yellow" | "red";

const GREEN_THRESHOLD_DAYS = 30;
const YELLOW_THRESHOLD_DAYS = 90;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getContactStatus(lastDate: string | undefined): ContactStatus {
	if (!lastDate) return "red";
	const days = (Date.now() - new Date(lastDate).getTime()) / MS_PER_DAY;
	if (days <= GREEN_THRESHOLD_DAYS) return "green";
	if (days <= YELLOW_THRESHOLD_DAYS) return "yellow";
	return "red";
}

export const STATUS_COLOR: Record<ContactStatus, string> = {
	green: "success.main",
	yellow: "warning.main",
	red: "error.main",
};
