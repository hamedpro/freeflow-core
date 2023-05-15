import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	custom_axios_download,
	custom_delete,
	leave_here,
	update_document,
} from "../../api/client";

import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { MessagesBox } from "./MessagesBox";
import ObjectBox from "./ObjectBox";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { Item, Menu, useContextMenu } from "react-contexify";

export const Resource = () => {
	var nav = useNavigate();
	var { resource_id } = useParams();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var resource_row = global_data.all.resources.find((i) => i._id === resource_id);
	var { show } = useContextMenu({
		id: "options_context_menu",
	});
	if (resource_row === undefined) {
		return <h1>resource you are looking for doesn't even exist</h1>;
	} /* else if (resource_row.collaborators.map((i) => i.user_id).includes(user_id) !== true) {
		return <h1>access denied! you are not a collaborator of this resource</h1>;
	} */
	async function export_unit_handler() {
		await custom_axios_download({
			file_name: `resources-${resource_id}-at-${new Date().getTime()}.tar`,
			url: new URL(
				`/v2/export_unit?unit_id=${resource_id}&unit_context=resources`,
				window.api_endpoint
			),
		});
	}
	async function change_resource_handler(type) {
		/* if (!resource_row.collaborators.map((i) => i.user_id).includes(user_id)) {
			alert(
				"access denied! to do this you must either be the owner of this resource or an admin of that"
			);
			return;
		} */
		var user_input = window.prompt(`enter new value for ${type}`);
		if (!user_input) {
			alert("you cancelled or your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "resources",
			update_filter: {
				_id: resource_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_resource() {
		if (resource_row.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		if (!window.confirm("are you sure you want to leave this resource ? ")) return;
		leave_here({ user_id, context: "resources", context_id: resource_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_resource() {
		/* if (resource_row.collaborators.find((i) => i.user_id === user_id).is_owner !== true) {
			alert("access denied! only owner of this resource can do this.");
			return;
		} */
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "resources",
			id: resource_id,
		})
			.then(
				(i) => {
					alert("all done");
					nav(`/dashboard`);
				},
				(error) => {
					console.log(error);
					alert("something went wrong! details in console");
				}
			)
			.finally(get_global_data);
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
				<Item id="leave_here" onClick={leave_this_resource}>
					Leave Here
				</Item>
				<Item id="delete_resource" onClick={delete_this_resource}>
					Delete Resource
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
							url: new URL(`/v2/files/${resource_row.file_id}`, window.api_endpoint),
							file_name: resource_row.file_id,
						})
					}
				>
					<i className="bi-cloud-download-fill" /> download this resource
				</StyledDiv>
				<CollaboratorsManagementBox context={"resources"} id={resource_id} />
				<h1>resource data : </h1>
				<ObjectBox object={resource_row} />

				<MessagesBox />
			</div>
		</>
	);
};
