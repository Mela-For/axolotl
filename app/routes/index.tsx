import { Navigate } from "react-router";

export function clientLoader() {
	return null;
}
clientLoader.hydrate = true as const;

export default function Index() {
	return <Navigate to="/profiles" replace />;
}
