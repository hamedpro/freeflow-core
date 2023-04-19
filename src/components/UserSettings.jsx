import React, { useContext } from "react";
import { custom_axios, get_users, update_document } from "../../api/client";
import { Section } from "./section";
import Select from "react-select";
import { GlobalDataContext } from "../GlobalDataContext";
import { StyledDiv } from "./styled_elements";
import axios from "axios";
export const UserSettings = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var user_id = localStorage.getItem("user_id");
	var user = get_users({ filters: { _id: user_id }, global_data })[0];
	async function simple_update(key, new_value) {
		var update_set = {};
		update_set[key] = new_value;
		await update_document({
			collection: "users",
			update_filter: {
				_id: user_id,
			},
			update_set,
		});
		await get_global_data();
	}
	async function set_profile_picture() {
		var files = document.getElementById("new_profile_image_input").files;
		if (files.lenght === 0) {
			alert("first select an image");
			return;
		}
		var f = new FormData();
		f.append("file", files[0]);
		var profile_image_file_id = (
			await axios({
				baseURL: window.api_endpoint,
				url: "/v2/files",
				method: "post",
				data: f,
			})
		).data.file_id;
		await update_document({
			collection: "users",
			update_filter: {
				_id: user_id,
			},
			update_set: {
				profile_image_file_id,
			},
		});

		get_global_data();
	}
	async function import_exported_unit() {
		var files = document.getElementById("importing_exported_unit").files;
		if (files.length !== 1) {
			alert("Error : selected files count is invalid");
			return;
		}
		var f = new FormData();
		f.append("file", files[0]);
		var uploaded_file_id = (
			await axios({
				baseURL: window.api_endpoint,
				url: "/v2/files",
				method: "post",
				data: f,
			})
		).data.file_id;
		try {
			var response = await axios({
				baseURL: window.api_endpoint,
				method: "post",
				data: {
					file_id: uploaded_file_id,
				},
				url: "/import_exported_file",
			});
			alert("done !");
		} catch (error) {
			console.log(error);
			alert("something went wrong, details are in console");
		}

		await get_global_data();
	}
	if (user === null) return <h1>loading user ... </h1>;
	return (
		<>
			<div className="p-2">
				<h1>UserSettings</h1>
				<div style={{ width: "200px", height: "200px" }}>
					{user.profile_image_file_id ? (
						<img
							src={
								new URL(
									`/v2/files/${user.profile_image_file_id}`,
									window.api_endpoint
								).href
							}
							className="w-full h-full"
						/>
					) : (
						<div className="w-full h-full bg-blue-600"></div>
					)}
				</div>
				<input type="file" id="new_profile_image_input" className="mt-2 block " />
				<StyledDiv onClick={set_profile_picture} className="w-fit mt-2">
					set this new profile image
				</StyledDiv>
			</div>
			<Section title="importing exported unit">
				<input type="file" id="importing_exported_unit" />
				<StyledDiv className="w-fit mt-2" onClick={import_exported_unit}>
					start importing
				</StyledDiv>
			</Section>
			<Section title={"selecting type of calendar"}>
				<Select
					onChange={(e) => simple_update("calendar_type", e.value)}
					options={[
						{ value: null, label: "not chosen (use default )" },
						...["persian", "arabic", "english"].map((type) => {
							return {
								value: type,
								label: type,
							};
						}),
					]}
					value={{
						value: user.calendar_type,
						label:
							user.calendar_type === null
								? "not chosen (use default )"
								: user.calendar_type,
					}}
				/>
			</Section>

			<Section title={"selecting starting day of week"}>
				<Select
					onChange={(e) => simple_update("week_starting_day", e.value)}
					options={[
						{ value: null, label: "not chosen (use default )" },
						{
							label: "popluar options",
							options: ["saturday", "sunday", "monday"].map((i) => {
								return { value: i, label: i };
							}),
						},

						{
							label: "others",
							options: ["tuesday", "wednesday", "thursday", "friday"].map((i) => {
								return { value: i, label: i };
							}),
						},
					]}
					value={{
						value: user.week_starting_day,
						label:
							user.week_starting_day === null
								? "not chosen (use default )"
								: user.week_starting_day,
					}}
				/>
			</Section>
			<Section title={"selecting language"}>
				<Select
					onChange={(e) => simple_update("language", e.value)}
					options={[
						{ value: null, label: "not chosen (use default )" },
						{ value: "english", label: "english" },
						{ value: "persian", label: "persian" },
					]}
					value={{
						value: user.language,
						label: user.language === null ? "not chosen (use default )" : user.language,
					}}
				/>
			</Section>
			<Section title={"changing personal information"}>
				{["email_address", "mobile", "username", "full_name"].map((i, index) => {
					return (
						<div key={index} className="block">
							{user[i] ? (
								<>
									<span>{i}</span> : {user[i]}
								</>
							) : (
								<>
									<span>{i}</span> :{" "}
									<span>there is not any value for this field yet</span>
								</>
							)}
							<button
								className="border border-green-600 rounded  px-2 ml-2"
								onClick={() => {
									simple_update(i, window.prompt(`enter new value for ${i}`));
								}}
							>
								change value
							</button>
						</div>
					);
				})}
			</Section>
		</>
	);
};
