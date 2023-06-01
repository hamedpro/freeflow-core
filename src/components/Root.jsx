import React, { useEffect } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { Section } from "./section";

export const Root = () => {
	var nav = useNavigate();
	var user_is_loged_in = localStorage.getItem("jwt") !== null;
	useEffect(() => {
		if (user_is_loged_in) {
			nav("/dashboard");
		}
	}, []);

	if (user_is_loged_in) {
		return "redirecting to dashboard.";
	}
	return (
		<>
			<h1>here is root route of the website</h1>
			<Section title="options">
				<Link to="/login">i want to login in my account</Link>
				<br />
				<Link to="/register">i want to create a new account</Link>
			</Section>
		</>
	);
};
