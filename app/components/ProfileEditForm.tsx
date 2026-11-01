import {
	Box,
	Button,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import type { Profile } from "app/types/Profile";
import { useEffect, useState } from "react";
import {
	INDUSTRIES,
	MAX_IMAGE_SIZE_BYTES,
	SENIORITY_LEVELS,
} from "~/utils/constants";
import {
	updateProfile,
	uploadProfileImage,
} from "../utils/profileDataInterface";
import { useToast } from "./ToastProvider";

interface ProfileEditFormProps {
	profile: Profile;
	onCancel: () => void;
	onSave: (updatedProfile: Profile) => void;
}

type FieldErrors = {
	name?: string;
	email?: string;
	phone?: string;
	linkedin?: string;
};

function validate(fields: {
	name: string;
	email: string;
	phone: string;
	linkedin: string;
}): FieldErrors {
	const errors: FieldErrors = {};
	if (!fields.name.trim()) errors.name = "Name is required.";
	if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
		errors.email = "Please enter a valid email address.";
	if (fields.phone && !/^[0-9()\-+\s]{7,15}$/.test(fields.phone))
		errors.phone = "Please enter a valid phone number (e.g. 802-555-1234).";
	if (fields.linkedin && !/^https?:\/\/.+/.test(fields.linkedin))
		errors.linkedin =
			"Please enter a valid URL starting with http:// or https://.";
	return errors;
}

export default function ProfileEditForm({
	profile,
	onCancel,
	onSave,
}: ProfileEditFormProps) {
	const { addToast } = useToast();
	const [name, setName] = useState(profile.name ?? "");
	const [location, setLocation] = useState(profile.location ?? "");
	const [industry, setIndustry] = useState(profile.industry ?? "");
	const [job, setJob] = useState(profile.job ?? "");
	const [company, setCompany] = useState(profile.company ?? "");
	const [seniority, setSeniority] = useState(profile.seniority ?? "");
	const [email, setEmail] = useState(profile.email ?? "");
	const [phone, setPhone] = useState(profile.phone ?? "");
	const [linkedin, setLinkedin] = useState(profile.linkedin ?? "");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;
		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			addToast("Image must be under 5MB", "error");
			return;
		}
		if (!file.type.startsWith("image/")) {
			addToast("Please select a valid image file", "error");
			return;
		}
		if (preview) URL.revokeObjectURL(preview);
		setImageFile(file);
		setPreview(URL.createObjectURL(file));
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const fieldErrors = validate({ name, email, phone, linkedin });
		if (Object.keys(fieldErrors).length > 0) {
			setErrors(fieldErrors);
			return;
		}
		setErrors({});
		setIsSubmitting(true);
		let imageUrl = profile.image;
		if (imageFile) {
			try {
				imageUrl = await uploadProfileImage(imageFile);
			} catch {
				addToast("Failed to upload image. Please try again.", "error");
				setIsSubmitting(false);
				return;
			}
		}
		try {
			const updatedProfile = await updateProfile(profile.id, {
				name,
				location,
				industry,
				company,
				job,
				seniority,
				email,
				linkedin,
				phone,
				image: imageUrl,
			});
			onSave(updatedProfile);
		} catch {
			addToast("Failed to update profile. Please try again.", "error");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			sx={{
				mt: 3,
				p: 3,
				border: "1px solid #eee",
				borderRadius: 2,
				backgroundColor: "white",
			}}
		>
			<Typography variant="h6" gutterBottom>
				Edit Profile
			</Typography>

			<Stack spacing={2}>
				<TextField
					id="name"
					label="Name"
					value={name}
					onChange={(event) => setName(event.target.value)}
					error={!!errors.name}
					helperText={errors.name}
					fullWidth
				/>

				<TextField
					id="location"
					label="Location"
					value={location}
					onChange={(event) => setLocation(event.target.value)}
					fullWidth
				/>

				<TextField
					id="industry"
					label="Industry"
					value={industry}
					onChange={(event) => setIndustry(event.target.value)}
					select
					fullWidth
				>
					<MenuItem value="">Select industry</MenuItem>
					{INDUSTRIES.map((ind) => (
						<MenuItem key={ind} value={ind}>
							{ind}
						</MenuItem>
					))}
				</TextField>

				<TextField
					id="company"
					label="Company"
					value={company}
					onChange={(event) => setCompany(event.target.value)}
					fullWidth
				/>

				<TextField
					id="job"
					label="Job Title"
					value={job}
					onChange={(event) => setJob(event.target.value)}
					fullWidth
				/>

				<TextField
					id="seniority"
					label="Seniority"
					value={seniority}
					onChange={(event) => setSeniority(event.target.value)}
					select
					fullWidth
				>
					<MenuItem value="">Select seniority</MenuItem>
					{SENIORITY_LEVELS.map((level) => (
						<MenuItem key={level} value={level}>
							{level}
						</MenuItem>
					))}
				</TextField>

				<TextField
					id="email"
					label="Email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					error={!!errors.email}
					helperText={errors.email}
					fullWidth
				/>

				<TextField
					id="linkedin"
					label="LinkedIn"
					value={linkedin}
					onChange={(event) => setLinkedin(event.target.value)}
					error={!!errors.linkedin}
					helperText={errors.linkedin}
					fullWidth
				/>

				<TextField
					id="phone"
					label="Phone"
					value={phone}
					onChange={(event) => setPhone(event.target.value)}
					error={!!errors.phone}
					helperText={errors.phone}
					fullWidth
				/>

				<Box>
					<Typography variant="body2" sx={{ mb: 1 }}>
						Profile Picture
					</Typography>

					{(preview ?? profile.image) && (
						<Box
							component="img"
							src={preview ?? profile.image ?? undefined}
							alt="Profile preview"
							sx={{
								width: 100,
								height: 100,
								objectFit: "cover",
								borderRadius: "50%",
								mb: 1,
								display: "block",
							}}
						/>
					)}

					<Button variant="outlined" component="label">
						Upload Image
						<input
							type="file"
							accept="image/*"
							hidden
							onChange={handleImageChange}
							aria-label="profile picture"
						/>
					</Button>
				</Box>

				<Box
					sx={{
						display: "flex",
						gap: 1,
						justifyContent: "flex-end",
					}}
				>
					<Button type="button" variant="outlined" onClick={onCancel}>
						Cancel
					</Button>

					<Button type="submit" variant="contained" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</Box>
			</Stack>
		</Box>
	);
}
