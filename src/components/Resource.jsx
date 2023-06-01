import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { custom_axios_download } from "../../api/client";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { StyledDiv } from "./styled_elements";
import { Item, Menu, useContextMenu } from "react-contexify";

export const Resource = ({ cache_item }) => {
	var nav = useNavigate();

	var user_id = uhc.user_id;
	var { cache } = useContext(UnifiedHandlerClientContext);
	var { show } = useContextMenu({
		id: "options_context_menu",
	});

	async function export_unit_handler() {
		alert("feature coming soon!");
		return;
		await custom_axios_download({
			file_name: `resources-${resource_id}-at-${new Date().getTime()}.tar`,
			url: new URL(
				`/v2/export_unit?unit_id=${resource_id}&unit_context=resources`,
				window.api_endpoint
			),
		});
	}
	async function change_resource_handler(type) {
		var user_input = window.prompt(`enter new value for ${type}`);
		if (!user_input) {
			alert("you cancelled or your input was an empty string");
			return;
		}

		await uhc.request_new_transaction({
			new_thing_creator: (prev) => ({
				...prev,
				value: { ...prev.value, [type]: user_input },
			}),
			thing_id: cache_item.thing_id,
		});
		alert("all done ");
	}

	return (
		<>
			<Menu id="options_context_menu">
				<Item id="change_title" onClick={() => change_resource_handler("title")}>
					Change Title
				</Item>
				<Item
					id="change_description"
					onClick={() => change_resource_handler("description")}
				>
					Change Description
				</Item>

				<Item id="export_unit" onClick={export_unit_handler}>
					Export Unit
				</Item>
			</Menu>
			<div className="p-4">
				<div className="flex justify-between mb-1 items-center p-1">
					<h1 className="text-lg">Resource</h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>
				<StyledDiv
					className="w-fit mt-2 mb-3"
					onClick={() =>
						custom_axios_download({
							configured_axios: uhc.configured_axios,
							url: `/files/${cache_item.thing.value.file_id}`,
							file_name: cache_item.thing.value.title,
						})
					}
				>
					<i className="bi-cloud-download-fill" /> download this resource
				</StyledDiv>
				<h1>resource title : {cache_item.thing.value.title}</h1>
				<h1>resource description : {cache_item.thing.value.description}</h1>
			</div>
		</>
	);
};
