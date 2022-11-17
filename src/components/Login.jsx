import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { custom_axios } from "../../api/client";
import { setCookie } from "../common";
export function Login() {
	var custom_nav = useNavigate()
	var [active_part, set_active_part] = useState(null);
	var [verification_asker_details, set_verf_asker_details] = useState(null); /* 
		when user has filled the input asking for verification code and we have sent verf code to him
		and want to change the layout to verify_code part we store that user's info temporarily here 
	*/
	/* 
        possible values for active_part:
			password_based, //stands for auth with a pair of an (email or phone_number or username) and a password
			send_email,
			send_sms,
			null //shows page to select each of the other values,
			verify_code //this page is for when a verification code is sent to user
    */
	function dgebi(id) {
		//just a shorthand shorthand 
		return document.getElementById(id).value;
	}
	async function password_based_login() {
		var input_value = dgebi("password_based_input_1");
		var password_input_value = dgebi("password_based_password_input");
		
		//todo make sure this algorithm below covers all possible cases
		var kind_of_input = null
		if (input_value.includes("@")) {
			kind_of_input = "email_address";
		} else if (input_value.split("")[0] == 0 && input_value.split("")[1] == 9) {
			kind_of_input = "mobile";
		} else {
			kind_of_input = "username";
		} //todo ask user whether value kind detecting has gone wrong or not 
		try {
			var body = {};
			body[kind_of_input] = input_value;
			body["password"] = password_input_value;
			body["kind_of_input"] = kind_of_input
			var response = await custom_axios({
				route: "/login_methods/password_based",
				body,
				method : "POST"
			});
			if (typeof response === "boolean" && response === true) {
				alert('auth was performed!')
				setCookie("identity", JSON.stringify({
					value: input_value,
					kind : kind_of_input
				}), 2)
				custom_nav('/')
			} else {
				alert('user was found but your password was wrong. please check it again')
			}
		} catch (error) {
			console.log(error);
			alert(
				"something went wrong while trying to make a request to the server : details in console"
			);
		}
	}
	async function send_email_verification() {
		var input_value = dgebi("send_email_input");
		try {
			var response = await custom_axios({
				route: "/login_methods/send_verification_code",
				body: {
					email_address: input_value,
					kind_of_input : "email_address"
				},
				method : "POST"
			});
			alert("all done !");
			set_verf_asker_details({
				kind_of_input: 'email_address',
				value: input_value
			}) //todo take care set_state is async and should not be used immediately  (right now its not checked immediately so there is not any problem )
			set_active_part("verify_code");
		} catch (error) {
			console.log(error);
			alert(
				"something went wrong while trying to make a request to the server : details in console"
			);
			
		}
	}
	async function send_sms_verification() {
		var input_value = dgebi("send_sms_input");
		try {
			var response = await custom_axios({
				route: "/login_methods/send_verification_code",
				body: {
					mobile: input_value,
					kind_of_input : "mobile"
				},
				method : "POST"
			});
			set_verf_asker_details({
				kind_of_input: 'mobile',
				value: input_value
			}) //todo also take care set state is async and its value may not be available immediately (right now its not checked immediately so there is not any problem )
			set_active_part("verify_code");
		} catch (error) {
			console.log(error);
			alert(
				"something went wrong while trying to make a request to the server : details in console"
			);
		}
	}
	async function check_verification_code() {
		if (verification_asker_details === null) {
			alert('you should fill the verification code request form first. you will be redirected')
			set_active_part(null)
			return
		}
		var input_value = Number(dgebi("verification_code_input"));
		if (isNaN(input_value)) {
			alert(
				"verification code is a number but you have entered a value that is not even convertable to number!"
			);
			return;
		}
		try {
			var body = {}
			body[verification_asker_details['kind_of_input']] = verification_asker_details['value']
			body['verf_code'] = input_value
			body['kind_of_input'] = verification_asker_details['kind_of_input']
			var response = await custom_axios({
				route: `/login_methods/verification_code_test`,
				body,
				method : "POST"
			});
			if (response === true ) {
				alert('auth was performed!')
				setCookie("identity", JSON.stringify({
					value: verification_asker_details['value'],
					kind : verification_asker_details['kind_of_input']
				}), 2)
				custom_nav('/')
			} else {
				alert('verification code was not correct. please try checking what you have typed')
			}
		} catch (error) {
			console.log(error);
			alert(
				"something went wrong while trying to make a request to the server : details in console"
			);
		}
	}
	return (
		<>
			<h1>login page</h1>
			{active_part === null && (
				<>
					<h1>please select one of these login methods belows:</h1>
					<div className="flex flex-col">
					<button className="border border-blue-400"
						onClick={() => {
							set_active_part("password_based");
						}}
					>
						password based auth
					</button>
					<button className="border border-blue-400"
						onClick={() => {
							set_active_part("send_email");
						}}
					>
						auth by sending email
					</button>
					<button className="border border-blue-400"
						onClick={() => {
							set_active_part("send_sms");
						}}
					>
						auth by sending sms
						</button>
						</div>
				</>
			)}

			{active_part === "password_based" && (
				<>
					<h1>enter either username or password or email address of your account:</h1>
					<input id="password_based_input_1" />
					<h1>enter your password here:</h1>
					<input id="password_based_password_input" />
					{/* checkbox to remember me (also on the other cases) */}
					<button onClick={password_based_login}>login</button>
				</>
			)}

			{active_part === "send_email" && (
				<>
					<h1>
						enter your email address. a verification code will be sent to you through
						email
					</h1>
					<input id="send_email_input" />
					<button onClick={send_email_verification}>get verification code</button>
				</>
			)}

			{active_part === "verify_code" && (
				<>
					<h1>enter that verification code which was sent to you:</h1>
					<input id="verification_code_input" />

					<button onClick={check_verification_code}>apply verification code </button>
				</>
			)}
			{active_part === "send_sms" && (
				<>
					<h1>
						enter your phone number. a verification code will be sent to you through sms
					</h1>
					<input id="send_sms_input" />
					<button onClick={send_sms_verification}>get verification code</button>
				</>
			)}
		</>
	);
}
