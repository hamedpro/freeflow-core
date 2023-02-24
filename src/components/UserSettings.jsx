import React, { useContext } from "react";
import { get_users, update_document, upload_files } from "../../api/client";
import { Section } from "./section";
import Select from "react-select";
import { GlobalDataContext } from "../GlobalDataContext";
import { StyledDiv } from "./styled_elements";
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
		await upload_files({
			data: { user_id },
			input_element_id: "new_profile_image_input",
			task: "set_new_profile_picture",
		});
		get_global_data();
	}
	if (user === null) return <h1>loading user ... </h1>;
	return (
		<>
			<div className="p-2">
				<h1>UserSettings</h1>
				<div style={{ width: "200px", height: "200px" }}>
					{user.profile_image ? (
						<img
							src={
								new URL(
									`/profile_images/${user.profile_image}`,
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
