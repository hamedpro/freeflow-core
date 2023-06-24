import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extract_user_id } from "../../api_dist/api/utils";
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext";
import { StyledDiv } from "./styled_elements";
export const Login = () => {
	var { profiles_seed, set_virtual_local_storage } = useContext(VirtualLocalStorageContext);
	var nav = useNavigate();
	var [login_mode, set_login_mode] = useState(); // verf_code_mode or password_mode
	async function login() {
		var input_value = document.getElementById("value_input").value;
		if (!input_value) {
			alert("input can not be empty");
			return;
		}
		try {
			var { jwt } = (
				await window.uhc.configured_axios({
					url: "login",
					data: {
						value: input_value,
						login_mode,
						identifier: document.getElementById("identifier_input").value,
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
			alert("auth couldnt be done .");
		}
	}
	async function send_verification_code() {
		var identifier = document.getElementById("identifier").value;
		if (!identifier) {
			alert("identifier input can not be empty.");
			return;
		}
		await window.uhc.configured_axios({
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
			alert("Error! could not send verification code.");
		}
	}
	return (
		<div className="flex flex-col justify-center items-center p-4 w-1/2 mx-auto">
			<h1 className="text-4xl mb-2">Login</h1>
			<div className="text-center">enter an identifier. it can be one of these:</div>
			<ul>
				<li>your email address </li>
				<li>mobile phone</li>
				<li>username , user_id</li>
				<li>user_id</li>
			</ul>

			<input
				className="border border-blue-400 w-full rounded mt-5"
				id="identifier_input"
				disabled={login_mode !== undefined}
			/>
			<br />
			{login_mode === undefined ? (
				<div className="flex flex-col justify-center items-center">
					<br />
					<StyledDiv
						className="border border-blue-500 w-full text-center"
						onClick={() => go_step_2("verf_code_mode")}
					>
						login using verfication code
					</StyledDiv>

					<StyledDiv
						className="border border-blue-500 w-full mt-2 text-center"
						onClick={() => go_step_2("password_mode")}
					>
						login with password
					</StyledDiv>
				</div>
			) : (
				<>
					<b>
						{login_mode === "verf_code_mode" &&
							"if this account has phone number verification code is sent to it and just like that for email address. enter it here and hit the button "}
					</b>
					<p>
						{login_mode === "password_mode" &&
							"enter your password and hit the button "}
					</p>
					<input className="border border-blue-400" id="value_input" />
					<br />{" "}
					<StyledDiv className="border border-blue-500 w-fit" onClick={login}>
						login{" "}
					</StyledDiv>
				</>
			)}
		</div>
	);
};
