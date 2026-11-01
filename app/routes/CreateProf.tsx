import { useNavigate } from "react-router";
import CreateProfile from "~/components/CreateProfile";

export default function CreateProf() {
	const navigate = useNavigate();

	function doCancel() {
		navigate(-1);
	}

	return <CreateProfile onCancel={doCancel} />;
}
