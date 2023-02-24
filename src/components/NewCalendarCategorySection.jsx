import React, { useContext } from "react";
import { new_calendar_category } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";

export const NewCalendarCategorySection = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var user_id = window.localStorage.getItem("user_id");
	return (
		<Section
			className="mt-2"
			title="creating a calendar category"
			style={{ padding: "0px", marginX: "0px" }}
		>
			<p>name of calendar category :</p>
			<input className="px-1 rounded" id="new_calendar_category_name_input" />
			<p className="mt-2">
				and enter one of these colors here :
				"yellow","red","blue","darkblue","green","purple","black"
			</p>
			<input id="new_calendar_category_color_input" className="block px-1 rounded" />
			<StyledDiv
				className="w-fit mt-2"
				onClick={async () => {
					await new_calendar_category({
						user_id,
						name: document.getElementById("new_calendar_category_name_input").value,
						color: document.getElementById("new_calendar_category_color_input").value,
					});
					alert(
						"new calendar category was added to your profile successfuly.above options will be updated. please select it"
					);
					get_global_data();
				}}
			>
				create category
			</StyledDiv>
		</Section>
	);
};
