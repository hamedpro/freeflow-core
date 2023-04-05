import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinkLikeP } from "./link_like_p";
import { Section } from "./section";

export const RegisterStep1 = () => {
	var nav = useNavigate();
	var [terms_are_accepted, set_terms_are_accepted] = useState(false);
	var [username_input_value, set_username_input_value] = useState(null);

	async function go_to_register_step_2() {
		if (!terms_are_accepted) {
			alert("in order to use our services you have to agree with our terms of use");
			return;
		}

		if (username_input_value === null) {
			alert("select one of those options first");
			return;
		} else if (username_input_value === "") {
			alert("input value can not be empty");
			return;
		}

		nav(`/register/step2?username=${username_input_value}`);
	}
	return (
		<div className="p-2">
			<Section title="registeing new user">
				<div className="px-2">
					<h1 className="mb-2">choose a username for yourself : </h1>
					<input
						onChange={(event) => {
							set_username_input_value(event.target.value);
						}}
						className="border border-blue-400 rounded px-1"
					/>
					<div
						onClick={() =>
							set_terms_are_accepted((terms_are_accepted) => !terms_are_accepted)
						}
						className="flex items-center space-x-1 mt-2"
					>
						{terms_are_accepted ? (
							<i className="bi-toggle-on"></i>
						) : (
							<i className="bi-toggle-off" />
						)}
						i accept{" "}
						<LinkLikeP link="/terms" className="inline-block">
							terms of use
						</LinkLikeP>
						.
					</div>

					<button
						className="border border-blue-400 rounded block mt-2 px-2 py-1 hover:text-white hover:bg-blue-600 duration-300"
						onClick={go_to_register_step_2}
					>
						continue
					</button>
				</div>
			</Section>
		</div>
	);
};
