import axios from "axios";
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export const LoginMethodChoosing = () => {
	var [search_params, set_search_params] = useSearchParams();
	var user_id = search_params.get("user_id");
	var nav = useNavigate();
	async function verification_based_onclick_handler(verification_kind) {
		//verification_kind must be either "mobile" or "email_address"
		try {
			await axios({
				baseURL: window.api_endpoint,
				url: `/v2/auth/send_verification_code`,
				data: {
					user_id,
					kind: verification_kind,
				},
				method: "post",
			});
			nav(
				`/login/verification_based?user_id=${user_id}&verification_kind=${
					verification_kind === "mobile" ? "mobile" : "email_address"
				}`
			);
		} catch (error) {
			console.log(error);
			alert(`something went wrong : \n ${error.response.status} - ${error.response.data}`);
		}
	}
	return (
		<div>
			<h1>choose login method you want to use:</h1>
			<Link to={`/login/password_based?user_id=${user_id}`}>login with password</Link>
			<h1 onClick={() => verification_based_onclick_handler("email_address")}>
				login with email address verification
			</h1>
			<h1 onClick={() => verification_based_onclick_handler("mobile")}>
				login with phone number verification
			</h1>
		</div>
	);
};
