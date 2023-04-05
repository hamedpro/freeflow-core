import React, { useContext, useState } from "react";
import { new_event } from "../../api/client";
import { TextField } from "@mui/material";
//import AdapterMoment from "@date-io/jalaali";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useEffect } from "react";
import { get_calendar_categories, new_calendar_category } from "../../api/client";
import Select from "react-select";
import { NewCalendarCategorySection } from "./NewCalendarCategorySection";
import { GlobalDataContext } from "../GlobalDataContext";
import { StyledDiv } from "./styled_elements";
import { useNavigate } from "react-router-dom";

export const NewEvent = () => {
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var [selected_calendar_category, select_calendar_category] = useState(null);
	var [calendar_categories, set_calendar_categories] = useState(null);
	var [selected_dates, set_selected_dates] = useState({ end: null, start: null });
	var [selected_collaborators, set_selected_collaborators] = useState([]);
	var nav = useNavigate();
	var submit_new_event = async () => {
		try {
			var tmp = {
				end_date: selected_dates.end,
				start_date: selected_dates.start,
				category_id: selected_calendar_category.value._id,
				title: document.getElementById("title_input").value,
				description: document.getElementById("description_input").value,
				user_id,
				collaborators: [
					...selected_collaborators.map((i) => {
						return { is_owner: false, user_id: i.value };
					}),
					{ user_id, is_owner: true },
				],
			};

			tmp = await new_event(tmp);
			nav(`/dashboard/events/${tmp}`);
			alert("done");
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in dev console.");
		}
	};

	async function get_data() {
		set_calendar_categories(await get_calendar_categories({ user_id, global_data }));
	}
	useEffect(() => {
		get_data();
	}, [global_data]);

	if (calendar_categories === null) return <h1>still loading data ...</h1>;

	return (
		<div className="p-2">
			<h1>NewEvent</h1>
			<p className="mt-2">enter a title :</p>
			<input id="title_input" className="rounded px-1" />
			<p className="mt-2">enter a description :</p>
			<input id="description_input" className="rounded px-1" />
			<h2 className="mt-2">select an existing calendar category or create a new one</h2>
			<Select
				onChange={select_calendar_category}
				value={selected_calendar_category}
				options={[
					...calendar_categories.map((cat) => {
						return {
							value: cat,
							label: `${cat.name} (${cat.color})`,
						};
					}),
				]}
				isSearchable
			/>
			<NewCalendarCategorySection />

			<h2 className="mt-2">select 'start' and 'end' dates for this task : </h2>
			{["start", "end"].map((type, index) => {
				return (
					<div key={index} className="mb-3 mt-2 block">
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DateTimePicker
								renderInput={(props) => <TextField {...props} />}
								label={`select task ${type} date`}
								value={selected_dates[type]}
								onChange={(newValue) => {
									set_selected_dates((prev_dates) => {
										var tmp = { ...prev_dates };
										tmp[type] = newValue.$d.getTime();
										return tmp;
									});
								}}
							/>
						</LocalizationProvider>
					</div>
				);
			})}
			<h1>add collaborators to this new task :</h1>
			<Select
				onChange={set_selected_collaborators}
				value={selected_collaborators}
				options={[
					...global_data.all.users
						.filter((user) => user._id !== user_id)
						.map((user) => {
							return {
								value: user._id,
								label: `@${user.username}`,
							};
						}),
				]}
				isMulti
				isSearchable
			/>
			<StyledDiv onClick={submit_new_event} className="w-fit mt-2">
				submit this event
			</StyledDiv>
		</div>
	);
};
