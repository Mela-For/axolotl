import { Alert, Snackbar } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "error" | "success" | "warning" | "info";

const ToastContext = createContext<{
	addToast: (message: string, type: ToastType) => void;
} | null>(null);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within ToastProvider");
	return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toast, setToast] = useState<{
		message: string;
		type: ToastType;
	} | null>(null);

	const addToast = useCallback((message: string, type: ToastType) => {
		setToast({ message, type });
	}, []);

	return (
		<ToastContext.Provider value={{ addToast }}>
			{children}
			<Snackbar
				open={toast !== null}
				autoHideDuration={4000}
				onClose={() => setToast(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setToast(null)}
					severity={toast?.type}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{toast?.message}
				</Alert>
			</Snackbar>
		</ToastContext.Provider>
	);
}
