import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { custom_axios, v2_get_user, v2_update_user } from "../../api/client";
export const VerifyIdentity = () => {
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();
	var user_id = search_params.get("user_id");
	var next_page = search_params.get("next_page");
	if (next_page === "complete_register") {
		var callback_url = `/register/complete_user_registering?user_id=${user_id}`;
	} else {
		var callback_url = `/`;
	}
	var [check_verification_code_mode, set_check_verification_code_mode] = useState(false);
	var kind_of_input = search_params.get("kind_of_input");
	var identity = search_params.get("identity");
	var [selected_kind_of_verification, set_selected_kind_of_verification] = useState(null);
	var [input_value, set_input_value] = useState(null);
  async function send_verification_code() {
    try {
      var body = { kind_of_input: selected_kind_of_verification };
      body[selected_kind_of_verification] = user[selected_kind_of_verification];
      var response = await custom_axios({
        route: "/login_methods/send_verification_code",
        body,
        method: "POST",
      });
      set_check_verification_code_mode(true )
    } catch (error) {
      console.log(error)
      alert('something went wrong. details in console')
    }
	}
	var [user, set_user] = useState(null);
  async function get_user() {
		set_user(await v2_get_user({user_id}));
	}
	useEffect(() => {
		get_user();
	}, []);
	async function check_verification_code() {
		try {
			var body = {};
      body[selected_kind_of_verification] = user[selected_kind_of_verification];
			body["verf_code"] = document.getElementById('verification_code_input').value;
			body["kind_of_input"] = selected_kind_of_verification;
			var response = await custom_axios({
				route: `/login_methods/verification_code_test`,
				body,
				method: "POST",
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
			await v2_update_user({
				kind: "password",
				new_value: document.getElementById("password_input").value,
			});
			nav(callback_url);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console ");
		}
	}
	async function update_user({ kind, new_value }) {
		try {
			await v2_update_user({ user_id,kind, new_value });
			await get_user();
		} catch (error) {
			console.log(error);
			alert("something went wrong when updating user info. details in console");
		}
  }
  if (user === null) {
    return <p>loading user info ...</p>
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
										onClick={() => set_selected_kind_of_verification(option)}
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
										you have not set field "{selected_kind_of_verification}" for you account so
										enter it first and we will send a verification code to it
									</p>
									<input id="new_input_value" />
									<button
										onClick={() => {
											update_user({
												kind: selected_kind_of_verification,
												new_value:
													document.getElementById("new_input_value")
														.value,
											});
										}}
									>
										update my {selected_kind_of_verification}
									</button>
								</>
							) : (
								<button onClick={() => send_verification_code()}>
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
