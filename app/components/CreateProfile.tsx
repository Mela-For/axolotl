import {
	Box,
	Button,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	INDUSTRIES,
	MAX_IMAGE_SIZE_BYTES,
	SENIORITY_LEVELS,
} from "~/utils/constants";
import {
	createProfile,
	uploadProfileImage,
} from "~/utils/profileDataInterface";
import { useToast } from "./ToastProvider";

interface CreateProfileProps {
	onCancel?: () => void;
}

export default function CreateProfile({ onCancel }: CreateProfileProps) {
	const { addToast } = useToast();
	const navigate = useNavigate();
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
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

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const name = formData.get("name")?.toString().trim();
		if (!name) {
			addToast("Name is required.", "error");
			return;
		}

		const phone = formData.get("phoneNumber")?.toString().trim() || undefined;
		if (phone && !/^[0-9()\-+\s]{7,15}$/.test(phone)) {
			addToast(
				"Please enter a valid phone number (e.g. 802-555-1234).",
				"error",
			);
			return;
		}

		const email = formData.get("email")?.toString().trim() || undefined;
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			addToast("Please enter a valid email address.", "error");
			return;
		}

		setIsSubmitting(true);

		let imageUrl: string | undefined;
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
			await createProfile({
				name,
				email,
				phone,
				job: formData.get("jobTitle")?.toString() || undefined,
				company: formData.get("company")?.toString() || undefined,
				location: formData.get("location")?.toString() || undefined,
				industry: formData.get("industry")?.toString() || undefined,
				seniority: formData.get("seniority")?.toString() || undefined,
				linkedin: formData.get("linkedin")?.toString() || undefined,
				image: imageUrl,
			});
			navigate("/profiles");
		} catch {
			addToast("Failed to create profile. Please try again.", "error");
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
				maxWidth: 600,
				mx: "auto",
			}}
		>
			<Typography variant="h6" gutterBottom>
				Create Profile
			</Typography>

			<Stack spacing={2}>
				<Box>
					<Typography variant="body2" sx={{ mb: 1 }}>
						Profile Picture
					</Typography>

					{preview && (
						<Box
							component="img"
							src={preview}
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

				<TextField id="name" name="name" label="Name" required fullWidth />

				<TextField
					id="email"
					name="email"
					label="Email"
					type="email"
					fullWidth
				/>

				<TextField
					id="phoneNumber"
					name="phoneNumber"
					label="Phone Number"
					type="tel"
					slotProps={{
						htmlInput: {
							pattern: "[0-9()\\-\\+\\s]{7,15}",
							title: "Enter a valid phone number (e.g. 802-555-1234)",
						},
					}}
					fullWidth
				/>

				<TextField id="jobTitle" name="jobTitle" label="Job Title" fullWidth />

				<TextField id="company" name="company" label="Company" fullWidth />

				<TextField id="location" name="location" label="Location" fullWidth />

				<TextField
					id="industry"
					name="industry"
					label="Industry"
					defaultValue=""
					select
					fullWidth
				>
					<MenuItem value="">Select industry</MenuItem>
					{INDUSTRIES.map((industry) => (
						<MenuItem key={industry} value={industry}>
							{industry}
						</MenuItem>
					))}
				</TextField>

				<TextField
					id="seniority"
					name="seniority"
					label="Seniority"
					defaultValue=""
					select
					fullWidth
				>
					<MenuItem value="">Select seniority</MenuItem>
					{SENIORITY_LEVELS.map((seniority) => (
						<MenuItem key={seniority} value={seniority}>
							{seniority}
						</MenuItem>
					))}
				</TextField>

				<TextField id="linkedin" name="linkedin" label="LinkedIn" fullWidth />

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
						{isSubmitting ? "Creating..." : "Create Profile"}
					</Button>
				</Box>
			</Stack>
		</Box>
	);
}
