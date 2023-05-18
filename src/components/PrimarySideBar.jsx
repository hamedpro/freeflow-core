import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import {
	check_being_collaborator,
	custom_find_unique,
	find_unit_parents,
	gen_thing_link,
} from "../../common_helpers";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

function AddNewOptionRow() {
	var nav = useNavigate();
	var { current_surface_cache } = useContext(UnifiedHandlerClientContext);
	function onclick_handler(type) {
		var { pathname } = window.location;
		var my_regex =
			/(?:\/)*dashboard\/(?<thing_context>asks|resources|notes|tasks|events|packs)\/(?<thing_id>[0-9]+).*$/g;
		var tmp = my_regex.exec(pathname);
		if (tmp) {
			var pack_id =
				tmp.groups.thing_context === "packs"
					? tmp.groups.thing_id
					: find_unit_parents(current_surface_cache, tmp.groups.thing_id)[0];
			nav(
				`/dashboard/${type.split("/")[1] + "s"}/new` +
					(pack_id ? `?pack_id=${pack_id}` : "")
			);
		} else {
			
			nav(`/dashboard/${type.split("/")[1] + "s"}/new`);
		}
	}
	return (
		<div className="flex justify-around  p-1 border-b border-black">
			{[
				{
					type: "unit/pack",
					icon: <i className="bi-box-fill text-white"></i>,
				},
				{
					type: "unit/task",
					icon: <i className="bi-clipboard-fill text-white"></i>,
				},
				{
					type: "unit/resource",
					icon: <i className="bi-cloud-upload-fill text-white"></i>,
				},
				{
					type: "unit/note",
					icon: <i className="bi-card-text text-white"></i>,
				},
				{
					type: "unit/event",
					icon: <i className="bi-calendar4-event text-white"></i>,
				},
				{
					type: "unit/ask",
					icon: <i className="bi-patch-question-fill text-white"></i>,
				},
			].map((i) => (
				<button
					key={i.type}
					onClick={() => onclick_handler(i.type)}
					className=" hover:bg-blue-700 rounded p-1"
				>
					{i.icon}
				</button>
			))}
		</div>
	);
}
function Option({ text, indent_level, url, type }) {
	var nav = useNavigate();
	var is_selected = useMatch(url);
	return (
		<div
			className={[
				"border-b border-black flex  py-1 items-center w-full cursor-pointer hover:bg-blue-700 duration-200 space-x-2",
				is_selected ? "bg-blue-800 text-white" : "",
			].join(" ")}
			style={{ paddingLeft: indent_level * 20 + 8 + "px" }}
			onClick={() => nav(url)}
		>
			<div className="text-white">
				<>
					{type === "unit/pack" && <i className="bi-box-fill" />}
					{type === "unit/note" && <i className="bi-card-text" />}
					{type === "unit/task" && <i className="bi-clipboard-fill" />}
					{type === "unit/resource" && <i className="bi-cloud-download-fill" />}
					{type === "unit/ask" && <i className="bi-patch-question-fill" />}
					{type === "unit/event" && <i className="bi-calendar4-event" />}
				</>
			</div>
			<span>{text}</span>
		</div>
	);
}
export const PrimarySideBar = () => {
	var { current_surface_cache } = useContext(UnifiedHandlerClientContext);
	var loc = useLocation();

	function create_downside_tree({ thing_id, indent_level }) {
		//it returns an array of options (with correct order and indentation and ready to be rendered )
		var assosiated_surface_cache_item = current_surface_cache.find(
			(i) => i.thing_id === thing_id
		);
		if (assosiated_surface_cache_item.thing.type !== "unit/pack") {
			return [
				{
					text: `${
						assosiated_surface_cache_item[
							assosiated_surface_cache_item.thing.type === "unit/ask"
								? "question"
								: "title"
						]
					}`,

					url: gen_thing_link(current_surface_cache, thing_id),
					type: assosiated_surface_cache_item.thing.type,
					indent_level,
				},
			];
		} else {
			var tmp = [
				{
					text: `${assosiated_surface_cache_item.thing.current_state.title}`,
					url: `/dashboard/packs/${thing_id}`,

					type: assosiated_surface_cache_item.thing.type,
					indent_level,
				},
			]; //here

			current_surface_cache
				.filter(
					(i) =>
						i.thing.type !== "unit/pack" &&
						i.thing.type.startsWith("unit/") &&
						i.thing.current_state.pack_id === thing_id
				)
				.forEach((i) => {
					tmp.push(
						...create_downside_tree({
							thing_id: i.thing_id,
							indent_level: indent_level + 1,
						})
					);
				});

			current_surface_cache
				.filter(
					(i) =>
						i.thing.type === "unit/pack" && i.thing.current_state.pack_id === thing_id
				)
				.forEach((pack) => {
					tmp.push(
						...create_downside_tree({
							thing_id: pack.thing_id,
							indent_level: indent_level + 1,
						})
					);
				});
			return tmp;
		}
	}
	function create_full_tree(thing_id) {
		//thing_type must start with "unit/"

		//finds and returns full tree containing
		// that thing and anything discoverable above or below it
		//(parent, parent of parent and just like this for children )

		if (
			current_surface_cache.find((i) => i.thing_id === thing_id).thing.current_state.pack_id
		) {
			var latest_visible_parent = current_surface_cache.find((i) => i.thing_id === thing_id)
				.thing.current_state.pack_id;
			while (
				current_surface_cache.find((i) => i.thing_id === latest_visible_parent).thing
					.current_state.pack_id
			) {
				latest_visible_parent = current_surface_cache.find(
					(i) => i.thing_id === latest_visible_parent
				).thing.current_state.pack_id;
			}
			return create_downside_tree({
				thing_id: latest_visible_parent,
				indent_level: 0,
			});
		} else {
			return create_downside_tree({
				thing_id,
				indent_level: 0,
			});
		}
	}
	function compare_custom_trees(tree1, tree2) {
		if (tree1.length !== tree2.length) {
			return false;
		}
		for (var i = 0; i < tree1.length; i++) {
			for (var prop of ["text", "url"]) {
				//todo add indent_level in props list
				if (tree1[i][prop] !== tree2[i][prop]) {
					return false;
				}
			}
		}
		return true;
	}

	var trees = [];
	current_surface_cache
		.filter((i) => i.thing.type.startsWith("unit/"))
		.forEach((i) => {
			trees.push(create_full_tree(i.thing.type, i.thing_id));
		});
	//create trees here
	//current_surface_cache.

	var options = custom_find_unique(trees, compare_custom_trees).flat();
	if (options == null) {
		return "loading options ...";
	}
	return (
		<>
			<AddNewOptionRow />
			{options.map((option, index) => (
				<Option key={index} {...option} />
			))}
		</>
	);
};
