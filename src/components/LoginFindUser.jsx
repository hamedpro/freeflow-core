import { useNavigate } from "react-router-dom";
import { flexible_user_finder } from "../../api/client";
import { Section } from "./section";

export const LoginFindUser = () => {
	var nav = useNavigate();
	async function find_user() {
		try {
			var response = await flexible_user_finder({
				value: document.getElementById("input").value,
			});
			nav(`/login/method_choosing?user_id=${response._id}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong when trying to find user account. details in console");
		}
	}
	return (
		<Section title="login page">
			<p>please enter either one of these and click "find my account" :</p>
			<ul>
				<li>an email_address</li>
				<li>a mobile phone number</li>
				<li>a username</li>
				<li>a user_id</li>
			</ul>
			<input className="border border-blue-400 px-2 rounded mx-2" id="input" />
			<button onClick={find_user}>find my account</button>
		</Section>
	);
};
