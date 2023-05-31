import React, { useContext, useState } from "react";
import { TextField } from "@mui/material";
//import AdapterMoment from "@date-io/jalaali";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Select from "react-select";
import { NewCalendarCategorySection } from "./NewCalendarCategorySection";
import { StyledDiv } from "./styled_elements";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";

export const NewEvent = () => {
	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);

	var [selected_calendar_category, select_calendar_category] = useState(null);
	var calendar_categories = cache.filter((i) => i.thing.type === "calendar_category");
	var [selected_dates, set_selected_dates] = useState({ end: null, start: null });
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
	var submit_new_event = async () => {
		try {
			var new_event = {
				type: "unit/event",
				value: {
					end_date: selected_dates.end,
					start_date: selected_dates.start,
					category_id: selected_calendar_category.value,
					title: document.getElementById("title_input").value,
					description: document.getElementById("description_input").value,
				},
			};

			var new_event_id = await uhc.request_new_transaction({
				new_thing_creator: () => new_event,
				thing_id: undefined,
			});
			var new_meta = {
				type: "meta",
				value: {
					thing_privileges: privileges,
					modify_thing_privileges: uhc.user_id,
					locks: [],
					pack_id: selected_parent_pack.value,
					thing_id: new_event_id,
				},
			};
			var meta_id = await uhc.request_new_transaction({
				new_thing_creator: () => new_meta,
				thing_id: undefined,
			});
			nav(`/dashboard/${new_event_id}`);
			alert("done");
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in dev console.");
		}
	};
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
							value: cat.thing_id,
							label: `${cat.thing.value.name} (${cat.thing.value.color})`,
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
			<PrivilegesEditor onChange={set_privileges} />
			<h1 className="mt-2">select a parent pack for this ask if you want :</h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ value: null, label: "without a parent pack " },
					...cache
						.filter((i) => i.thing.type === "unit/pack")
						.map((cache_item) => {
							return {
								value: cache_item.thing_id,
								label: cache_item.thing.value.title,
							};
						}),
				]}
				isSearchable
			/>
			<StyledDiv onClick={submit_new_event} className="w-fit mt-2">
				submit this event
			</StyledDiv>
		</div>
	);
};
