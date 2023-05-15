import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	custom_axios_download,
	custom_delete,
	leave_here,
	update_document,
} from "../../api/client";

import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { MessagesBox } from "./MessagesBox";
import { Section } from "./section";
import { PackView } from "./PackView";
import { Item, Menu, useContextMenu } from "react-contexify";
export const Pack = () => {
	var { pack_id } = useParams();
	var user_id = window.localStorage.getItem("user_id");
	var nav = useNavigate();
	var [pack_view_filters, set_pack_view_filters] = useState({
		view_as_groups: false,
		sort: "timestamp_asce",
		// possible values : "timestamp_asce" | "timestamp_desc"
	});
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var pack = global_data.all.packs.find((pack) => pack._id === pack_id);

	//when for the first time pack is there and instead of loading
	//actual data is showing up we set default pack view as selected_view state
	//but it must just happen on first update when pack is true
	var tmp = useRef(false);

	useEffect(() => {
		if (pack && pack.default_pack_view_id && tmp.current === false) {
			set_selected_view({
				value: pack.default_pack_view_id,
				label: global_data.all.pack_views.find(
					(pack_view) => pack_view._id === pack.default_pack_view_id
				).name,
			});
			tmp.current = true;
		}
	});
	var { show } = useContextMenu({
		id: "options_context_menu",
	});
	if (pack === undefined) {
		return <h1>there is not any pack with that id </h1>;
	}

	/* if (pack.collaborators.map((i) => i.user_id).includes(user_id) !== true) {
		return <h1>access denied! :that pack was found but you are not a collaborator of that </h1>;
	} */

	//pack_children only includes direct children of this pack and not its grandchildren
	//items of this array look like this :
	//{ context: "notes" | "tasks" | "resources" | "packs" , child : that document }

	var pack_children = [];
	["packs", "resources", "notes", "tasks"].forEach((key) => {
		pack_children = pack_children.concat(
			global_data.all[key]
				.filter((i) => i.pack_id === pack._id)
				.map((i) => ({ context: key, child: i }))
		);
	});
	async function change_pack_handler(type) {
		/* if (!pack.collaborators.map((i) => i.user_id).includes(user_id)) {
			alert("access denied! to do this you must be a collaborator of this pack ");
			return;
		} */
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "packs",
			update_filter: {
				_id: pack_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_pack() {
		if (pack.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "packs", context_id: pack_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_pack() {
		/* if (pack.collaborators.find((i) => i.user_id === user_id).is_owner === false) {
			alert("access denied! only owner of this pack can do this.");
			return;
		} */
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "packs",
			id: pack_id,
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
	async function export_unit_handler() {
		await custom_axios_download({
			file_name: `packs-${pack_id}-at-${new Date().getTime()}.tar`,
			url: new URL(
				`/v2/export_unit?unit_id=${pack_id}&unit_context=packs`,
				window.api_endpoint
			),
		});
	}
	return (
		<>
			<Menu id="options_context_menu">
				<Item id="change_title" onClick={() => change_pack_handler("title")}>
					Change Title
				</Item>

				<Item id="change_description" onClick={() => change_pack_handler("description")}>
					Change Description
				</Item>

				<Item id="leave_note" onClick={leave_this_pack}>
					Leave Pack
				</Item>
				<Item id="delete_note" onClick={delete_this_pack}>
					Delete Pack
				</Item>
				<Item id="export_unit" onClick={export_unit_handler}>
					Export Unit
				</Item>
			</Menu>
			<div className="p-4">
				<div className="flex justify-between mb-1 items-center">
					<h1>Pack #{pack_id}</h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>
				<Section title="pack data :">
					<p>title : {pack.title} </p>
					<p>description : {pack.description} </p>
				</Section>
				<Section title="pack view customisation">
					<h1>sort mode : </h1>
					<p
						onClick={() =>
							set_pack_view_filters((prev) => ({ ...prev, sort: "timestamp_asce" }))
						}
					>
						{pack_view_filters.sort === "timestamp_asce" ? (
							<i className="bi-toggle-on" />
						) : (
							<i className="bi-toggle-off" />
						)}{" "}
						sorting ascending by time
					</p>
					<p
						onClick={() =>
							set_pack_view_filters((prev) => ({ ...prev, sort: "timestamp_desc" }))
						}
					>
						{pack_view_filters.sort === "timestamp_desc" ? (
							<i className="bi-toggle-on" />
						) : (
							<i className="bi-toggle-off" />
						)}{" "}
						sorting descending by time
					</p>
					<br />

					<h1>showing mode : </h1>
					<p
						onClick={() =>
							set_pack_view_filters((prev) => ({ ...prev, view_as_groups: true }))
						}
					>
						{pack_view_filters.view_as_groups ? (
							<i className="bi-toggle-on" />
						) : (
							<i className="bi-toggle-off" />
						)}
						grouped mode{" "}
					</p>
					<p
						onClick={() =>
							set_pack_view_filters((prev) => ({ ...prev, view_as_groups: false }))
						}
					>
						{pack_view_filters.view_as_groups !== true ? (
							<i className="bi-toggle-on" />
						) : (
							<i className="bi-toggle-off" />
						)}
						without groups{" "}
					</p>
				</Section>
				<PackView
					pack_children={pack_children} /* 
						sorting is done by PackView comp 
						it means you dont have to pass sorted data as pack_children 
					*/
					view_as_groups={pack_view_filters.view_as_groups}
					sort={pack_view_filters.sort}
				/>
				<CollaboratorsManagementBox context="packs" id={pack_id} />
				<MessagesBox />
			</div>
		</>
	);
};
