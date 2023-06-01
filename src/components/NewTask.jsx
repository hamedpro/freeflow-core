import { useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField } from "@mui/material";
//import AdapterMoment from "@date-io/jalaali";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Select from "react-select";

import { StyledDiv } from "./styled_elements";
import { NewCalendarCategorySection } from "./NewCalendarCategorySection";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
//TODO: component re-renders
export const NewTask = () => {
	var { cache } = useContext(UnifiedHandlerClientContext);
	var nav = useNavigate();
	var [privileges, set_privileges] = useState();
	var [search_params] = useSearchParams();
	var [selected_parent_pack, set_selected_parent_pack] = useState(() => {
		var pack_id = Number(search_params.get("pack_id"));
		if (pack_id) {
			let tmp = cache.find((i) => i.thing_id === pack_id);
			return {
				value: tmp.thing_id,
				label: tmp.thing.value.title,
			};
		} else {
			return { value: null, label: "without a parent pack" };
		}
	});

	const [title_input, set_title_input] = useState("");
	const [description_input, set_description_input] = useState("");
	//TODO: check _locale for possible option to output the _d(date) object in jalaali's format
	const [selected_dates, set_selected_dates] = useState({
		end: null,
		start: null,
	});
	async function submit_new_task() {
		try {
			var new_task_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "unit/task",
					value: {
						end_date: selected_dates.end,
						start_date: selected_dates.start,
						title: title_input,
						description: description_input,
						category_id: selected_calendar_category.value,
					},
				}),
				thing_id: undefined,
			});

			var new_meta_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "meta",
					value: {
						thing_privileges: privileges,
						modify_thing_privileges: uhc.user_id,
						locks: [],
						pack_id: selected_parent_pack.value,
						thing_id: new_task_id,
					},
				}),
				thing_id: undefined,
			});
			alert("all done. navigating to the newly created task's page");
			nav(`/dashboard/${new_task_id}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	var [selected_calendar_category, select_calendar_category] = useState(null);
	return (
		<div className="p-2">
			<h1>NewTask</h1>
			<h2 className="mt-2">enter a title for this task : </h2>
			<input className="px-1 rounded" onChange={(ev) => set_title_input(ev.target.value)} />
			<h2 className="mt-2">enter a description for this task : </h2>
			<textarea
				className="px-1 rounded"
				onChange={(ev) => set_description_input(ev.target.value)}
				rows={5}
			/>

			<h2 className="mt-2">select an existing calendar category or create a new one</h2>
			<p>(if what you want was not in existing categories create it now in section below)</p>
			<Select
				onChange={select_calendar_category}
				value={selected_calendar_category}
				options={[
					...cache
						.filter((i) => i.thing.type === "calendar_category")
						.map((i) => {
							return {
								value: i.thing_id,
								label: `${i.thing.value.name} (${i.thing.value.color})`,
							};
						}),
				]}
				isSearchable
			/>
			<NewCalendarCategorySection />

			<h2 className="mt-2">select 'start' and 'end' dates for this task : </h2>
			{["start", "end"].map((type, index) => {
				return (
					<div key={index} className="mb-3 block">
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
			<PrivilegesEditor onChange={set_privileges} />
			<h1>select a parent pack for this note if you want :</h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ value: null, label: "without a parent pack " },
					...cache
						.filter((i) => i.thing.type === "unit/pack")
						.map((i) => {
							return {
								value: i.thing_id,
								label: i.thing.value.title,
							};
						}),
				]}
				isSearchable
			/>
			<StyledDiv className="w-fit mt-2" onClick={submit_new_task}>
				submit
			</StyledDiv>
		</div>
	);
};
