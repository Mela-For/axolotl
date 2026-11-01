import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	route("login", "routes/login.tsx"),
	route("signup", "routes/signup.tsx"),
	route("forgot-password", "routes/forgot-password.tsx"),
	route("reset-password", "routes/reset-password.tsx"),
	layout("components/Layout.tsx", [
		index("routes/index.tsx"),
		route("profiles", "routes/profiles.tsx"),
		route("create-profile", "routes/CreateProf.tsx"),
		route("profiles/:id", "routes/profiles.$id.tsx"),
	]),
] satisfies RouteConfig;
