import React, { useContext, useState } from "react";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {
	var nav = useNavigate();
	var [login_mode, set_login_mode] = useState(); // verf_code_mode or password_mode
	var { unified_handler_client } = useContext(UnifiedHandlerClientContext);
	async function login() {
		var input_value = document.getElementById("value_input").value;
		if (!input_value) {
			alert("input can not be empty");
			return;
		}
		try {
			var { jwt } = (
				await unified_handler_client.configured_axios({
					url: "login",
					data: {
						value: input_value,
						login_mode,
						identifier: document.getElementById("identifier_input").value,
					},
					method: "post",
				})
			).data;
			alert("auth was done. going to reload the app ");
			localStorage.setItem("jwt", jwt);
			nav("/dashboard");
			location.reload();
		} catch (error) {
			console.log(error);
			alert("auth couldnt be done .");
		}
	}
	async function send_verification_code() {
		var identifier = document.getElementById("identifier").value;
		if (!identifier) {
			alert("identifier input can not be empty.");
			return;
		}
		await unified_handler_client.configured_axios({
			url: "/send_verification_code",
			data: {
				identifier,
			},
			method: "post",
		});
	}
	async function go_step_2(login_mode) {
		try {
			if (login_mode === "verf_code_mode") {
				await send_verification_code();
			}
			set_login_mode(login_mode);
		} catch (error) {
			alert("something went wrong");
		}
	}
	return (
		<>
			<h1>Login</h1>
			<h1>
				enter an identifier. it can be one of these : your email address , mobile phone ,
				username , user_id{" "}
			</h1>

			<input
				className="border border-blue-400"
				id="identifier_input"
				disabled={login_mode !== undefined}
			/>
			<br />
			{login_mode === undefined ? (
				<>
					<br />
					<button
						className="border border-blue-500"
						onClick={() => go_step_2("verf_code_mode")}
					>
						login using verfication code
					</button>
					<br />
					<button
						className="border border-blue-500"
						onClick={() => go_step_2("password_mode")}
					>
						login with password
					</button>
				</>
			) : (
				<>
					<b>
						{login_mode === "verf_code_mode" &&
							"if this account has phone number verification code is sent to it and just like that for email address. enter it here and hit the button "}
					</b>
					<b>
						{login_mode === "password_mode" &&
							"enter your password and hit the button "}
					</b>
					<input className="border border-blue-400" id="value_input" />
					<br />{" "}
					<button className="border border-blue-500" onClick={login}>
						login{" "}
					</button>
				</>
			)}
		</>
	);
};
