import React, { useContext, useEffect, useState } from "react";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { useNavigate } from "react-router-dom";
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext";
import { extract_user_id } from "../../api_dist/api/utils";
import validator from "validator";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
export const Register = () => {
	var { profiles_seed, set_virtual_local_storage } = useContext(VirtualLocalStorageContext);

	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);
	var [username_input_value, set_username_input_value] = useState("");
	var [password_input_value, set_password_input_value] = useState("");
	async function create_new_account() {
		if (!Object.values(validations).every((i) => i === true)) {
			alert("all validations must be passed");
			return;
		}
		if (!username_input_value || !password_input_value) {
			alert("password or username can not be empty");
			return;
		}
		try {
			var { jwt } = (
				await window.uhc.configured_axios({
					url: "/register",
					data: {
						username: username_input_value,
						password: password_input_value,
					},
					method: "post",
				})
			).data;

			alert("auth was done.");
			var user_id = extract_user_id(jwt);
			if (!profiles_seed.map((p_seed) => p_seed.user_id).includes(user_id)) {
				set_virtual_local_storage((prev) => ({
					...prev,
					profiles_seed: [
						...prev.profiles_seed.map((i) => ({ ...i, is_active: false })),
						{ user_id, jwt, is_active: true },
					],
				}));
			}
			nav("/dashboard");
		} catch (error) {
			console.log(error);
			alert("something went wrong. see more details in console");
		}
	}
	var validations = {
		username_is_available:
			cache
				.filter((i) => i.thing.type === "user")
				.map((i) => i.thing.value.username)
				.includes(username_input_value) !== true,
		password_is_strong: validator.isStrongPassword(password_input_value),
		username_is_valid: validator.isAlphanumeric(username_input_value),
	};

	return (
		<div className="p-4">
			<h1>register page</h1>
			<h1>enter a username:</h1>
			<input
				id="username_input"
				value={username_input_value}
				className="border border-blue-400 px-2"
				onChange={(e) => set_username_input_value(e.target.value)}
			/>
			{!validations.username_is_available && <p>username is taken</p>}
			<h1>enter a password:</h1>
			<input
				id="password_input"
				value={password_input_value}
				className="border border-blue-400 px-2"
				onChange={(e) => set_password_input_value(e.target.value)}
			/>
			<Section title={"validations"}>
				<Section title="rules">
					<div>
						<h3 className="text-2xl">username rules : </h3>
						<ul>
							<li>all characters English</li>
						</ul>
					</div>
					<hr />
					<div>
						<h3 className="text-2xl">password rules : </h3>
						<ul>
							<li>min numbers : 1 </li>
							<li>min lowercase : 1</li>
							<li>min uppercase : 1</li>
							<li>min symbols : 1</li>
							<li>min length : 8</li>
						</ul>
					</div>
				</Section>
				<Section title="status">
					<div>
						<span>
							[{validations.password_is_strong ? "ok" : "failed"}] : password strength{" "}
						</span>
					</div>
					<div>
						<span>
							[{validations.username_is_available ? "ok" : "failed"}] : username
							availability{" "}
						</span>
					</div>
					<div>
						<span>
							[{validations.username_is_valid ? "ok" : "failed"}] : username
							validation{" "}
						</span>
					</div>
				</Section>
			</Section>
			<StyledDiv
				onClick={create_new_account}
				className="w-fit "
				disabled={!Object.values(validations).every((i) => i === true)}
			>
				create new account{" "}
			</StyledDiv>
		</div>
	);
};
