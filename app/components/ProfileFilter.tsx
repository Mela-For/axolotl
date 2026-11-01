import {
	Box,
	FormControl,
	InputLabel,
	NativeSelect,
	TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { Profile } from "~/types/Profile";
import { INDUSTRIES, SENIORITY_LEVELS } from "~/utils/constants";

type ProfileFilterProps = {
	profiles: Profile[];
	onFilter: (filtered: Profile[]) => void;
};

export default function ProfileFilter({
	profiles,
	onFilter,
}: ProfileFilterProps) {
	const [seniority, setSeniority] = useState("");
	const [industry, setIndustry] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const filteredProfiles = useMemo(
		() =>
			profiles.filter((profile) => {
				const term = searchTerm.toLowerCase();
				return (
					(seniority === "" || seniority === profile.seniority) &&
					(industry === "" || industry === profile.industry) &&
					(term === "" ||
						profile.name.toLowerCase().includes(term) ||
						profile.location?.toLowerCase().includes(term) ||
						profile.company?.toLowerCase().includes(term))
				);
			}),
		[seniority, industry, searchTerm, profiles],
	);

	useEffect(() => {
		onFilter(filteredProfiles);
	}, [filteredProfiles, onFilter]);

	return (
		<Box
			sx={{
				display: "flex",
				gap: 2,
				alignItems: "flex-end",
				flexWrap: "wrap",
				mb: 3,
			}}
		>
			<TextField
				label="Search"
				slotProps={{ input: { "aria-label": "Search" } }}
				placeholder="Search by name, company, or location"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				size="small"
				sx={{ minWidth: 280 }}
			/>

			<FormControl size="small" sx={{ minWidth: 160 }}>
				<InputLabel shrink variant="standard" htmlFor="seniority-select">
					Seniority
				</InputLabel>
				<NativeSelect
					inputProps={{ id: "seniority-select", "aria-label": "Seniority" }}
					value={seniority}
					onChange={(e) => setSeniority(e.target.value)}
				>
					<option value="">All Seniorities</option>
					{SENIORITY_LEVELS.filter((s) =>
						profiles.some((p) => p.seniority === s),
					).map((s) => (
						<option value={s} key={s}>
							{s}
						</option>
					))}
				</NativeSelect>
			</FormControl>

			<FormControl size="small" sx={{ minWidth: 160 }}>
				<InputLabel shrink variant="standard" htmlFor="industry-select">
					Industry
				</InputLabel>
				<NativeSelect
					inputProps={{ id: "industry-select", "aria-label": "Industry" }}
					value={industry}
					onChange={(e) => setIndustry(e.target.value)}
				>
					<option value="">All Industries</option>
					{INDUSTRIES.filter((i) => profiles.some((p) => p.industry === i)).map(
						(i) => (
							<option value={i} key={i}>
								{i}
							</option>
						),
					)}
				</NativeSelect>
			</FormControl>
		</Box>
	);
}
