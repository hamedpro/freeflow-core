import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const LoginVerificationBased = () => {
	//when this component is used its supposed that a request for a verification code is sent before
	//this component only gets a verification code from user and checks it against existing one in DB

	//how it works : it gets what it must do through url search params
	//user_id : string : required , verification_kind : "email_address" | "mobile" : required

	var nav = useNavigate();
	var [search_params] = useSearchParams();
	var user_id = search_params.get("user_id");
	var verification_kind = search_params.get("verification_kind");

	var [user, set_user] = useState();
	async function fetch_data() {
		var response = await axios({
			baseURL: window.api_endpoint,
			url: `/v2/users`,
			method: "get",
		});
		set_user(response.data.find((i) => i._id === user_id));
	}
	useEffect(() => {
		fetch_data();
	}, []);
	async function check_verification_code() {
		axios({
			baseURL: window.api_endpoint,
			url: `/v2/auth/verification_code_verification`,
			data: {
				verf_code: document.getElementById("verification_code_input").value,
				user_id,
			},
			method: "post",
		}).then((response) => {
			if (response.data.verified === true) {
				window.localStorage.setItem("jwt", response.data.jwt);
				window.localStorage.setItem("user_id", user_id);
				alert("login approved!");
				nav("/dashboard");
			} else {
				alert("verification code invalid.");
			}
		});
	}
	return (
		<div>
			<p>verification code was sent to your</p>
			<h1>
				{verification_kind === "email_address"
					? `email address (${user ? user.email_address : "loading ..."})`
					: `phone number (${user ? user.mobile : "loading ..."})`}
			</h1>
			<input id="verification_code_input" className="border border-blue-500 rounded " />
			<button onClick={check_verification_code}>verify this code</button>
		</div>
	);
};
