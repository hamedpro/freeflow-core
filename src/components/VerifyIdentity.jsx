import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	auth,
	get_users,
	update_user as api_update_user,
	send_verification_code as api_send_verification_code,
} from "../../api/client";
import { custom_axios } from "../../api/client";
export const VerifyIdentity = () => {
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();
	var { user_id } = useParams();
	var [user, set_user] = useState(null);

	var next_page = search_params.get("next_page");
	if (next_page === "complete_register") {
		var callback_url = `/users/${user_id}/complete_user_registering`;
	} else {
		var callback_url = `/`;
	}
	var [check_verification_code_mode, set_check_verification_code_mode] = useState(false);
	var [selected_kind_of_verification, set_selected_kind_of_verification] = useState(null); //possible values for this : email_address , mobile
	async function send_verification_code() {
		try {
			await api_send_verification_code({
				user_id,
				kind: selected_kind_of_verification,
			});
			set_check_verification_code_mode(true);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	async function get_user() {
		var users = await get_users({
			filters: {
				_id: user_id,
			},
		});
		set_user(users[0]);
	}
	useEffect(() => {
		get_user();
	}, []);
	async function check_verification_code() {
		try {
			var response = await auth({
				user_id,
				verf_code: Number(document.getElementById("verification_code_input").value),
			});
			if (response === true) {
				alert("all done!");
				nav(callback_url);
			} else {
				alert("verification code is not correct. please try again ");
			}
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	async function submit_password() {
		try {
			await api_update_user({
				kind: "password",
				new_value: document.getElementById("password_input").value,
				user_id,
			});
			nav(callback_url);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console ");
		}
	}
	if (user === null) {
		return <p>loading user info ...</p>;
	}
	async function select_kind_of_verification(option) {
		if (!user[option]) {
			alert(
				`you have not set this field : "${option}". so we are not able to send verification code through this method. please set it first in the box above`
			);
			var tmp = confirm("do you want to set it right now and continue ?");
			if (!tmp) return;
			try {
				await api_update_user({
					user_id,
					new_value: prompt(`enter new value for ${option}`),
					kind: option,
				});
				set_selected_kind_of_verification(option);
			} catch (error) {
				console.log(error);
				alert("something went wrong. details in console ");
			}
		} else {
			set_selected_kind_of_verification(option);
		}
	}
	return (
		<>
			<p>use one these options to complete your account registering : </p>
			<h1>1- verify identity:</h1>
			{check_verification_code_mode ? (
				<>
					<p>verification code was sent to you please enter it here </p>
					<input id="verification_code_input" />
					<button onClick={check_verification_code}>check code </button>
				</>
			) : (
				<>
					{!selected_kind_of_verification ? (
						<>
							<p>i want to verify my:</p>
							{["email_address", "mobile"].map((option, index) => {
								return (
									<button
										onClick={() => select_kind_of_verification(option)}
										key={index}
									>
										{option}
									</button>
								);
							})}
						</>
					) : (
						<>
							{user[selected_kind_of_verification] === null ? (
								<>
									<p>
										you have not set field "{selected_kind_of_verification}" for
										your account so enter it first and we will send a
										verification code to it
									</p>
									<input id="new_input_value" />
									<button
										onClick={async () => {
											try {
												await api_update_user({
													kind: selected_kind_of_verification,
													user_id,
													new_value:
														document.getElementById("new_input_value")
															.value,
												});
												await get_user();
											} catch (error) {
												console.log(error);
												alert(
													"something went wrong when updating user info. details in console"
												);
											}
										}}
									>
										update my {selected_kind_of_verification}
									</button>
								</>
							) : (
								<button onClick={send_verification_code}>
									send verification code
								</button>
							)}
						</>
					)}
				</>
			)}

			<h2>2- just choose a password</h2>
			<input id="password_input" />
			<button onClick={submit_password}>submit password</button>
			<button onClick={() => nav(callback_url)}>skip </button>
		</>
	);
};
