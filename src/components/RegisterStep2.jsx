import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export const RegisterStep2 = () => {
	var [search_params] = useSearchParams();
	var username = search_params.get("username");
	return (
		<div>
			<h1>continue registering of {username}</h1>
			<p>select one of these options to complete creating your new account :</p>
			<div className="flex flex-col p-2 space-y-2">
				<Link to={`/register/step3?username=${username}&kind=password`}>
					<div className="border border-blue-400">
						<h1>using just a password</h1>
						<p>
							you have selected a username. you can simply pair a password with it so
							you can login to and use your account in future
						</p>
					</div>
				</Link>

				<Link to={`/register/step3?username=${username}&kind=mobile`}>
					<div className="border border-blue-400">
						<h1>verify phone number</h1>
						<p>
							set a phone number for your account. we send a verification code to you.
							by using this method you will always need to access your phone to be
							able to login into your account
						</p>
						-{">"}
					</div>
				</Link>

				<Link to={`/register/step3?username=${username}&kind=email_address`}>
					<div className="border border-blue-400 mt-2">
						<h1>verify email address </h1>
						<p>
							same as what was told about phone number verification but through
							sending an email
						</p>
						-{">"}
					</div>
				</Link>
			</div>
		</div>
	);
};
