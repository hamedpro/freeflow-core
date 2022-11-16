import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { new_user } from "../../api/client";
import { LinkLikeP } from "./link_like_p";

export const RegisterPage = ({}) => {
    var [terms_are_accepted,set_terms_are_accepted] = useState(false)
	var navigator = useNavigate();
	async function register() {
		if (!terms_are_accepted) { 
			alert('in order to use our services you have to agree with our terms of use')
			return
		}
		var entered_username = document.getElementById("username_input").value;
		var entered_password = document.getElementById("password_input").value;
		var entered_mobile = document.getElementById("mobile_input").value;
		var entered_email_address = document.getElementById("email_address_input").value;
		var re_entered_password = document.getElementById("re_enter_password_input").value;
		
        if (re_entered_password !== entered_password) {
			alert('password and re entered password are not same')
			return 
        }
        try {
           var response = await new_user({
            username : entered_username,
            password : entered_password,
            email_address : entered_email_address,
            mobile : entered_mobile
           }) 
            alert('all done')
            navigator(`/users/${entered_username}`)
        } catch (error) {
            //todo
            console.error(error)
            alert('something went wrong in progress of asking the server to add a new user (see details in console)')

        }
        
		
	}
	return (
        <>
            <h1>registeing new user</h1>
        <div className="px-2">
				<p>
					{"username"}
				</p>
				<input id="username_input" className="border border-blue-400 rounded px-1" />
				
				<p>
					{"password"}
				</p>
				<input
					id="password_input"
					className="border border-blue-400 rounded px-1"
					type="password"
				/>

				<p>
					re-enter your password:
				</p>
				<input
					id="re_enter_password_input"
					className="border border-blue-400 rounded px-1"
					type="password"
				/>

				<p>
					email address: <span className="text-xs">(**optional, leave empty to ignore)</span>
				</p>
				<input
					id="email_address_input"
					className="border border-blue-400 rounded px-1"
					type="email"
				/>

				<p>
					mobile phone number: <span className="text-xs">(**optional, leave empty to ignore)</span>
				</p>
				<input
					id="mobile_input"
					className="border border-blue-400 rounded px-1"
					type="text"
				/>
				<div
					onClick={() => set_terms_are_accepted(!terms_are_accepted)}
					className="flex items-center space-x-1 mt-2"
				>
					{terms_are_accepted ? <CheckBox /> : <CheckBoxOutlineBlank />}
					i accept <LinkLikeP
						link="/terms"
						className="inline-block"
					>terms of use</LinkLikeP>.
				</div>
				
				<button
					className="border border-blue-400 rounded block mt-2 px-2 py-1 hover:text-white hover:bg-blue-600 duration-300"
					onClick={register}
				>
					register new user
				</button>
            </div>
        </>
	);
}