import {
	Box,
	Button,
	Divider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import type { PersonalNote } from "~/utils/notesDataInterface";
import {
	addPersonalNote,
	deletePersonalNote,
	updatePersonalNote,
} from "~/utils/notesDataInterface";
import { useToast } from "./ToastProvider";

interface PersonalNotesProps {
	profileId: string;
	initialNotes: PersonalNote[];
}

export default function PersonalNotes({
	profileId,
	initialNotes,
}: PersonalNotesProps) {
	const { addToast } = useToast();
	const [notes, setNotes] = useState<PersonalNote[]>(initialNotes);
	const [input, setInput] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editInput, setEditInput] = useState("");
	const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);

	async function handleAdd() {
		const trimmed = input.trim();
		if (!trimmed) return;
		try {
			const newNote = await addPersonalNote(profileId, trimmed);
			setNotes((prev) => [...prev, newNote]);
			setInput("");
		} catch {
			addToast("Failed to add note. Please try again.", "error");
		}
	}

	async function handleUpdate(id: string) {
		const trimmed = editInput.trim();
		if (!trimmed) return;
		try {
			const updated = await updatePersonalNote(id, trimmed);
			setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
			setEditingId(null);
		} catch {
			addToast("Failed to update note. Please try again.", "error");
		}
	}

	async function handleDelete(id: string) {
		try {
			await deletePersonalNote(id);
			setNotes((prev) => prev.filter((note) => note.id !== id));
		} catch {
			addToast("Failed to delete note. Please try again.", "error");
		}
	}

	return (
		<Box sx={{ bgcolor: "grey.50", borderRadius: 2, p: 2.5 }}>
			<Typography variant="overline" sx={{ display: "block" }}>
				Personal Notes
			</Typography>
			<Divider sx={{ mb: 2 }} />

			{notes.length === 0 ? (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					No notes yet.
				</Typography>
			) : (
				<Box sx={{ mb: 2 }}>
					{notes.map((note) => (
						<Box
							key={note.id}
							sx={{
								py: 1.5,
								borderBottom: "1px solid",
								borderColor: "divider",
								"&:last-child": { borderBottom: "none" },
							}}
						>
							{editingId === note.id ? (
								<>
									<TextField
										fullWidth
										multiline
										size="small"
										value={editInput}
										onChange={(e) => setEditInput(e.target.value)}
										autoFocus
									/>
									<Box sx={{ display: "flex", gap: 1, mt: 1 }}>
										<Button
											variant="contained"
											size="small"
											onClick={() => handleUpdate(note.id)}
										>
											Save
										</Button>
										<Button
											variant="text"
											size="small"
											onClick={() => setEditingId(null)}
										>
											Cancel
										</Button>
									</Box>
								</>
							) : (
								<Stack
									direction="row"
									sx={{
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<Typography
										variant="body2"
										sx={{ flex: 1, mr: 1, whiteSpace: "pre-wrap" }}
									>
										{note.content}
									</Typography>
									<Stack direction="row" sx={{ flexShrink: 0 }}>
										<Button
											size="small"
											variant="text"
											onClick={() => {
												setEditingId(note.id);
												setEditInput(note.content);
											}}
										>
											Edit
										</Button>
										<Button
											size="small"
											variant="text"
											color="error"
											aria-label="Delete note"
											onClick={() => setNoteToDeleteId(note.id)}
										>
											Delete
										</Button>
									</Stack>
								</Stack>
							)}
						</Box>
					))}
				</Box>
			)}

			<Divider sx={{ mb: 2 }} />

			<Box sx={{ display: "flex", gap: 1 }}>
				<TextField
					size="small"
					fullWidth
					multiline
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Add a note..."
					onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAdd()}
				/>
				<Button
					variant="contained"
					onClick={handleAdd}
					sx={{ flexShrink: 0, alignSelf: "flex-start" }}
				>
					Add
				</Button>
			</Box>

			{noteToDeleteId !== null && (
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
							Delete personal note?
						</Typography>

						<Typography variant="body2" sx={{ mb: 2 }}>
							Are you sure you want to delete this personal note? This action
							cannot be undone.
						</Typography>

						<Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
							<Button
								type="button"
								variant="outlined"
								onClick={() => setNoteToDeleteId(null)}
							>
								Cancel
							</Button>

							<Button
								type="button"
								variant="contained"
								color="error"
								onClick={() => {
									handleDelete(noteToDeleteId);
									setNoteToDeleteId(null);
								}}
							>
								Delete
							</Button>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}
