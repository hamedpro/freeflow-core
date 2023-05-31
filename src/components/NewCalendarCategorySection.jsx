import React, { useContext } from "react";
import { new_calendar_category } from "../../api/client";

import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

export const NewCalendarCategorySection = () => {
	var { cache } = useContext(UnifiedHandlerClientContext);
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
					var new_cc_id = await uhc.request_new_transaction({
						new_thing_creator: () => ({
							type: "calendar_category",
							value: {
								name: document.getElementById("new_calendar_category_name_input")
									.value,
								color: document.getElementById("new_calendar_category_color_input")
									.value,
							},
						}),
						thing_id: undefined,
					});
					var new_meta_id = await uhc.request_new_transaction({
						new_thing_creator: () => ({
							type: "meta",
							value: {
								thing_privileges: { read: "*", write: "*" },
								modify_thing_privileges: uhc.user_id,
								locks: [],
								thing_id: new_cc_id,
							},
						}),
						thing_id: undefined,
					});

					alert("done! new calendar category was added");
				}}
			>
				create category
			</StyledDiv>
		</Section>
	);
};
