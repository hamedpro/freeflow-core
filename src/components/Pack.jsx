import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { custom_axios_download, custom_delete } from "../../api/client";
import { calc_units_tree } from "../../common_helpers.js";

import { Section } from "./section";
import { PackView } from "./PackView";
import { Item, Menu, useContextMenu } from "react-contexify";
export const Pack = ({ thing_id, cache }) => {
	var cache_item = cache.find((i) => i.thing_id === thing_id);
	var meta = uhc.find_thing_meta(cache_item.thing_id);
	if (meta === undefined)
		return "this thing exists but doesnt have a meta. create one for it first.";
	var user_id = uhc.user_id;
	var nav = useNavigate();

	var [pack_view_filters, set_pack_view_filters] = useState({
		view_as_groups: false,
		sort: "timestamp_asce",
		// possible values : "timestamp_asce" | "timestamp_desc"
	});

	useEffect(() => {
		var default_pack_view_id = cache_item.thing.value.default_pack_view_id;
		if (default_pack_view_id) {
			set_selected_view({
				value: default_pack_view_id,
				label: cache.find((i) => i.thing_id === default_pack_view_id).thing.value.title,
			});
		}
	}, []);
	var { show } = useContextMenu({
		id: "options_context_menu",
	});

	async function change_pack_handler(type) {
		var tmp = meta.thing.value.thing_privileges.write;
		if (tmp !== "*" && !tmp.includes(user_id)) {
			alert("access denied! you have not write access on this thing");
			return;
		}
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
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

	async function delete_this_pack() {
		alert("this feature will come soon");
		return;
		//todo implement deletion functionality for everything
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
		alert("feature coming soon");
		return;
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

				<Item id="delete_note" onClick={delete_this_pack}>
					Delete Pack
				</Item>
				<Item id="export_unit" onClick={export_unit_handler}>
					Export Unit
				</Item>
			</Menu>
			<div className="p-4">
				<div className="flex justify-between mb-1 items-center">
					<h1>Pack #{cache_item.thing_id}</h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>
				<Section title="pack data :">
					<p>title : {cache_item.thing.value.title} </p>
					<p>description : {cache_item.thing.value.description} </p>
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
					pack_children={Object.keys(calc_units_tree(cache, cache_item.thing_id)).map(
						(i) => Number(i)
					)}
					view_as_groups={pack_view_filters.view_as_groups}
					sort={pack_view_filters.sort}
					cache={cache}
				/>
				{/* <MessagesBox of={cache_item.thing_id} /> */}
			</div>
		</>
	);
};
