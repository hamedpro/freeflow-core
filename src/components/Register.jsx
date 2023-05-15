import React, { useContext, useEffect, useState } from "react";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { useNavigate } from "react-router-dom";

export const Register = () => {
	var nav = useNavigate();
	var { current_surface_cache, unified_handler_client } = useContext(UnifiedHandlerClientContext);
	var [username_input_value, set_username_input_value] = useState("");
	var [password_input_value, set_password_input_value] = useState("");
	async function create_new_account() {
		if (!username_input_value || !password_input_value) {
			alert("password or username can not be empty");
			return;
		}
		try {
			var { jwt } = (
				await unified_handler_client.configured_axios({
					url: "/register",
					data: {
						username: username_input_value,
						password: password_input_value,
					},
					method: "post",
				})
			).data;
			localStorage.setItem("jwt", jwt);
			alert("auth was done. going to reload the application  ");
			nav("/dashboard");
			window.location.reload();
		} catch (error) {
			console.log(error);
			alert("something went wrong. see more details in console");
		}
	}
	function selected_username_is_available() {
		return (
			current_surface_cache
				.filter((i) => i.thing.type === "user")
				.map((i) => i.thing.current_state.username)
				.includes(username_input_value) !== true
		);
	}
	return (
		<>
			<h1>register page</h1>
			<h1>enter a username:</h1>
			<input
				id="username_input"
				value={username_input_value}
				onChange={(e) => set_username_input_value(e.target.value)}
			/>
			{!selected_username_is_available() && <p>username is taken</p>}
			<h1>enter a password:</h1>
			<input
				id="password_input"
				value={password_input_value}
				onChange={(e) => set_password_input_value(e.target.value)}
			/>

			<button onClick={create_new_account} disabled={!selected_username_is_available()}>
				create new account{" "}
			</button>
		</>
	);
};
