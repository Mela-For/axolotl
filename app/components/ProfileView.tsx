import {
	Avatar,
	Box,
	Button,
	Chip,
	Divider,
	Link as MuiLink,
	Stack,
	Typography,
} from "@mui/material";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Profile } from "app/types/Profile";
import type { PersonalNote } from "app/utils/notesDataInterface";
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuButtonUnderline,
	MenuControlsContainer,
	MenuDivider,
	RichTextEditorProvider,
	RichTextField,
} from "mui-tiptap";
import { useState } from "react";
import { Form } from "react-router";
import PersonalNotes from "~/components/PersonalNotes";
import ProfileEditForm from "~/components/ProfileEditForm";
import { getContactStatus, STATUS_COLOR } from "~/utils/contactStatus";
import {
	addConversationLog,
	type ConversationLog,
	deleteConversationLog,
	updateConversationLog,
} from "~/utils/logDataInterface";
import { useToast } from "./ToastProvider";

interface ProfileViewProps {
	profile: Profile;
	initialNotes: PersonalNote[];
	initialLogs: ConversationLog[];
}

function LogItem({ content }: { content: string }) {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		editable: false,
		immediatelyRender: false,
	});
	return <EditorContent editor={editor} />;
}

function LogEditor({
	content,
	onSave,
	onCancel,
}: {
	content: string;
	onSave: (html: string) => void;
	onCancel: () => void;
}) {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		immediatelyRender: false,
	});
	if (!editor) return null;
	return (
		<>
			<RichTextEditorProvider editor={editor}>
				<RichTextField
					controls={
						<MenuControlsContainer>
							<MenuButtonBold />
							<MenuButtonItalic />
							<MenuButtonUnderline />
							<MenuDivider />
						</MenuControlsContainer>
					}
					sx={{
						border: "1px solid rgba(0, 0, 0, 0.2)",
						borderRadius: "4px",
						"& .ProseMirror": {
							padding: "12px",
							minHeight: "100px",
							outline: "none",
						},
					}}
				/>
			</RichTextEditorProvider>
			<Box sx={{ display: "flex", gap: 1, mt: 1 }}>
				<Button
					variant="contained"
					size="small"
					type="button"
					onClick={() => onSave(editor.getHTML())}
				>
					Save
				</Button>
				<Button
					variant="outlined"
					size="small"
					type="button"
					onClick={onCancel}
				>
					Cancel
				</Button>
			</Box>
		</>
	);
}

export default function ProfileView({
	profile,
	initialNotes,
	initialLogs,
}: ProfileViewProps) {
	const { addToast } = useToast();
	const [currentProfile, setCurrentProfile] = useState(profile);
	const [isEditing, setIsEditing] = useState(false);
	const [logs, setLogs] = useState<ConversationLog[]>(initialLogs);
	const [editingLogId, setEditingLogId] = useState<string | null>(null);
	const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
	const [logToDeleteId, setLogToDeleteId] = useState<string | null>(null);
	const status = getContactStatus(logs[0]?.date);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({ placeholder: "Type your log here..." }),
		],
		content: "",
		immediatelyRender: false,
	});

	async function handleSaveLog() {
		if (!editor) return;
		const newLog = await addConversationLog(
			currentProfile.id,
			editor.getHTML(),
		);
		setLogs((prev) => [newLog, ...prev]);
		editor.commands.setContent("");
	}

	async function handleUpdateLog(id: string, html: string) {
		const updated = await updateConversationLog(id, html);
		setLogs((prev) => prev.map((log) => (log.id === id ? updated : log)));
		setEditingLogId(null);
	}

	async function handleDeleteLog(id: string) {
		setDeletingLogId(id);
		try {
			await deleteConversationLog(id);
			setLogs((prev) => prev.filter((log) => log.id !== id));
		} catch {
			addToast("Failed to delete log. Please try again.", "error");
		} finally {
			setDeletingLogId(null);
		}
	}

	if (!editor) return null;

	return (
		<Box sx={{ padding: "20px" }}>
			<MuiLink
				component="a"
				href="/"
				underline="hover"
				sx={{ color: "primary.main" }}
			>
				← Back to Home
			</MuiLink>

			{isEditing ? (
				<ProfileEditForm
					profile={currentProfile}
					onCancel={() => setIsEditing(false)}
					onSave={(updated) => {
						setCurrentProfile(updated);
						setIsEditing(false);
					}}
				/>
			) : (
				<>
					{/* Profile header: centered photo with info below */}
					<Box
						sx={{
							mt: 2,
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
							alignItems: "center",
						}}
					>
						<Box
							sx={{
								width: "32%",
								aspectRatio: "1 / 1",
								borderRadius: 2,
								overflow: "hidden",
							}}
						>
							{currentProfile.image ? (
								<Box
									component="img"
									src={currentProfile.image}
									alt={currentProfile.name}
									sx={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										objectPosition: "center 20%",
										display: "block",
									}}
								/>
							) : (
								<Box
									sx={{
										width: "100%",
										height: "100%",
										bgcolor: "primary.main",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Typography
										sx={{ fontSize: 96, color: "white", lineHeight: 1 }}
									>
										{currentProfile.name.charAt(0)}
									</Typography>
								</Box>
							)}
						</Box>

						<Stack
							direction="row"
							spacing={1}
							sx={{ mt: 1.5, alignItems: "center" }}
						>
							<Typography variant="h5">{currentProfile.name}</Typography>
							<Box
								sx={{
									width: 10,
									height: 10,
									borderRadius: "50%",
									bgcolor: STATUS_COLOR[status],
									flexShrink: 0,
								}}
							/>
						</Stack>
						{[
							currentProfile.location,
							currentProfile.industry,
							currentProfile.company,
							currentProfile.job,
							currentProfile.seniority,
						].some(Boolean) && (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mt: 0.5 }}
							>
								{[
									currentProfile.location,
									currentProfile.industry,
									currentProfile.company,
									currentProfile.job,
									currentProfile.seniority,
								]
									.filter(Boolean)
									.join("  ·  ")}
							</Typography>
						)}
						<Stack
							direction="row"
							spacing={1}
							sx={{ mt: 1.5, flexWrap: "wrap", justifyContent: "center" }}
						>
							{currentProfile.email && (
								<Chip
									label={currentProfile.email}
									component="a"
									href={`mailto:${currentProfile.email}`}
									clickable
									size="small"
									variant="outlined"
								/>
							)}
							{currentProfile.phone && (
								<Chip
									label={currentProfile.phone}
									component="a"
									href={`tel:${currentProfile.phone}`}
									clickable
									size="small"
									variant="outlined"
								/>
							)}
							{currentProfile.linkedin && (
								<Chip
									label="LinkedIn"
									component="a"
									href={currentProfile.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									clickable
									size="small"
									variant="outlined"
									color="primary"
								/>
							)}
						</Stack>

						<Button variant="contained" onClick={() => setIsEditing(true)}>
							Edit Profile
						</Button>

						<Button
							type="button"
							variant="outlined"
							color="error"
							onClick={() => setShowDeleteConfirm(true)}
						>
							Delete Profile
						</Button>
					</Box>

					<Box sx={{ mt: 3 }}>
						<PersonalNotes
							profileId={currentProfile.id}
							initialNotes={initialNotes}
						/>
					</Box>

					<Box sx={{ mt: 4, bgcolor: "grey.50", borderRadius: 2, p: 2.5 }}>
						<Typography
							variant="overline"
							component="h2"
							sx={{ display: "block" }}
						>
							Contact Logs
						</Typography>
						<Divider sx={{ mb: 2 }} />

						{logs.length === 0 ? (
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								No contact logs yet.
							</Typography>
						) : (
							<Box sx={{ mb: 2 }}>
								{logs.map((log) => (
									<Box
										key={log.id}
										sx={{
											py: 1.5,
											borderBottom: "1px solid",
											borderColor: "divider",
											"&:last-child": { borderBottom: "none" },
										}}
									>
										{editingLogId === log.id ? (
											<LogEditor
												content={log.content}
												onSave={(html) => handleUpdateLog(log.id, html)}
												onCancel={() => setEditingLogId(null)}
											/>
										) : (
											<>
												<LogItem content={log.content} />
												<Stack
													direction="row"
													sx={{
														mt: 1,
														justifyContent: "space-between",
														alignItems: "center",
													}}
												>
													<Typography variant="caption" color="text.secondary">
														{new Date(log.date).toLocaleDateString(undefined, {
															timeZone: "UTC",
														})}
													</Typography>
													<Stack direction="row">
														<Button
															size="small"
															variant="text"
															onClick={() => setEditingLogId(log.id)}
														>
															Edit
														</Button>
														<Button
															size="small"
															variant="text"
															color="error"
															disabled={deletingLogId === log.id}
															onClick={() => setLogToDeleteId(log.id)}
														>
															{deletingLogId === log.id
																? "Deleting..."
																: "Delete"}
														</Button>
													</Stack>
												</Stack>
											</>
										)}
									</Box>
								))}
							</Box>
						)}

						<Divider sx={{ mb: 2 }} />

						<Typography variant="overline" sx={{ display: "block", mb: 1 }}>
							Add Contact Log
						</Typography>
						<RichTextEditorProvider editor={editor}>
							<RichTextField
								controls={
									<MenuControlsContainer>
										<MenuButtonBold />
										<MenuButtonItalic />
										<MenuButtonUnderline />
										<MenuDivider />
									</MenuControlsContainer>
								}
								sx={{
									border: "1px solid rgba(0, 0, 0, 0.2)",
									borderRadius: "4px",
									"& .ProseMirror": {
										padding: "12px",
										minHeight: "120px",
										outline: "none",
									},
									"& .ProseMirror p.is-editor-empty:first-of-type::before": {
										color: "#adb5bd",
										content: "attr(data-placeholder)",
										float: "left",
										height: 0,
										pointerEvents: "none",
									},
								}}
							/>
						</RichTextEditorProvider>
						<Button variant="contained" onClick={handleSaveLog} sx={{ mt: 1 }}>
							Save Log
						</Button>

						{logToDeleteId !== null && (
							<Box
								sx={{
									position: "fixed",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									backgroundColor: "rgb(0 0 0 / 40%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									zIndex: 10,
								}}
							>
								<Box
									sx={{
										backgroundColor: "white",
										padding: 3,
										borderRadius: 2,
										maxWidth: 400,
									}}
								>
									<Typography variant="h6" gutterBottom>
										Delete contact log?
									</Typography>

									<Typography variant="body2" sx={{ mb: 2 }}>
										Are you sure you want to delete this contact log? This
										action cannot be undone.
									</Typography>

									<Box
										sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
									>
										<Button
											type="button"
											variant="outlined"
											onClick={() => setLogToDeleteId(null)}
										>
											Cancel
										</Button>

										<Button
											type="button"
											variant="contained"
											color="error"
											onClick={() => {
												handleDeleteLog(logToDeleteId);
												setLogToDeleteId(null);
											}}
										>
											Delete
										</Button>
									</Box>
								</Box>
							</Box>
						)}
						{showDeleteConfirm && (
							<Box
								sx={{
									position: "fixed",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									backgroundColor: "rgb(0 0 0 / 40%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									zIndex: 10,
								}}
							>
								<Box
									sx={{
										backgroundColor: "white",
										padding: 3,
										borderRadius: 2,
										maxWidth: 400,
									}}
								>
									<Typography variant="h6" gutterBottom>
										Delete profile?
									</Typography>

									<Typography variant="body2" sx={{ mb: 2 }}>
										Are you sure you want to delete this profile? This action
										cannot be undone.
									</Typography>

									<Box
										sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
									>
										<Button
											type="button"
											variant="outlined"
											onClick={() => setShowDeleteConfirm(false)}
										>
											Cancel
										</Button>

										<Form method="post">
											<Button type="submit" variant="contained" color="error">
												Delete
											</Button>
										</Form>
									</Box>
								</Box>
							</Box>
						)}
					</Box>
				</>
			)}
		</Box>
	);
}
