import React, { useContext } from "react";
import { Section } from "./section";
import Select from "react-select";
import { StyledDiv } from "./styled_elements";
import axios from "axios";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
export const UserSettings = () => {
	var { cache } = useContext(UnifiedHandlerClientContext);

	var user_id = uhc.user_id;
	var user = cache.find((i) => i.thing_id === user_id);
	if (user === undefined) {
		return `thing could not be found :${user_id}`;
	}

	var values = { ...user.thing.value.$user_private_data.value, ...user.thing.value };
	var { calendar_type, week_starting_day, language } = values;

	async function simple_update(key, new_value) {
		var user_private_data_thing_id = Number(
			uhc.unresolved_cache
				.find((i) => i.thing_id === user_id)
				.thing.value.$user_private_data.split(":")[2]
		);
		if (
			["calendar_type", "week_starting_day", "language", "mobile", "email_address"].includes(
				key
			)
		) {
			await uhc.request_new_transaction({
				new_thing_creator: (prev) => ({
					...prev,
					value: { ...prev.value, [key]: new_value },
				}),
				thing_id: user_private_data_thing_id,
			});
		} else if (["username", "full_name"].includes(key)) {
			await uhc.request_new_transaction({
				new_thing_creator: (prev) => ({
					...prev,
					value: { ...prev.value, [key]: new_value },
				}),
				thing_id: user_id,
			});
		}
	}
	async function set_profile_picture() {
		var [file] = document.getElementById("new_profile_image_input").files;
		if (!file) {
			alert("first select an image");
			return;
		}
		var f = new FormData();
		f.append("file", file);
		var profile_image_file_id = (
			await uhc.configured_axios({
				url: "/files",
				data: f,
				method: "post",
			})
		).data;
		await uhc.request_new_transaction({
			new_thing_creator: (prev) => ({
				...prev,
				value: { ...prev.value, profile_image_file_id },
			}),
			thing_id: user_id,
		});
	}
	async function import_exported_unit() {
		alert("feature coming soon!");
		return;
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
	return (
		<>
			<div className="p-2">
				<h1>UserSettings</h1>
				<div style={{ width: "200px", height: "200px" }}>
					{user.thing.value.profile_image_file_id ? (
						<img
							src={
								new URL(
									`/files/${
										user.thing.value.profile_image_file_id
									}?jwt=${localStorage.getItem("jwt")}`,
									window.RESTFUL_API_ENDPOINT
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
						value: calendar_type || null,
						label: !calendar_type ? "not chosen (use default )" : calendar_type,
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
						value: week_starting_day || null,
						label: !week_starting_day ? "not chosen (use default )" : week_starting_day,
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
						value: language || null,
						label: !language ? "not chosen (use default )" : language,
					}}
				/>
			</Section>
			<Section title={"changing personal information"}>
				{["email_address", "mobile", "username", "full_name"].map((i, index) => {
					return (
						<div key={index} className="block">
							{values[i] ? (
								<>
									<span>{i}</span> : {values[i]}
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
