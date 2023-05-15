import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { check_being_collaborator, custom_find_unique } from "../../common_helpers";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

function AddNewOptionRow() {
	var nav = useNavigate();
	var { global_data } = useContext(GlobalDataContext);
	function onclick_handler(type) {
		/* 
		possible values for type : any unit 
		if type === "packs" it means create a new pack and the same for others
		*/
		if (type === "events") {
			//events cant be included in a pack
			nav(`/dashboard/events/new`);
			return;
		}

		var { pathname } = window.location;
		var my_regex = /(?:\/)*dashboard\/packs\/(?<pack_id>[0-9A-Fa-f]{24})(?:\/)*$/g;
		var tmp = my_regex.exec(pathname);
		if (tmp) {
			nav(`/dashboard/${type}/new?pack_id=${tmp.groups.pack_id}`);
		} else {
			//current active items is not a pack to create new note or ... inside it but
			//we check if this item has a parent we create this new note or ... inside that

			//todo this method of checking whether path matches pattern or not is not complete
			var my_regex =
				/(?:\/)*dashboard\/(?<thing_context>notes|resources|tasks|asks)\/(?<thing_id>[0-9A-Fa-f]{24})(?:\/)*$/g;

			var tmp = my_regex.exec(pathname);
			if (tmp) {
				var thing = global_data.all[tmp.groups.thing_context].find(
					(i) => i._id === tmp.groups.thing_id
				);
				if (thing.pack_id) {
					nav(`/dashboard/${type}/new?pack_id=${thing.pack_id}`);
				} else {
					nav(`/dashboard/${type}/new`);
				}
			} else {
				nav(`/dashboard/${type}/new`);
			}
		}
	}
	return (
		<div className="flex justify-around  p-1 border-b border-black">
			{[
				{
					type: "packs",
					icon: <i className="bi-box-fill text-white"></i>,
				},
				{
					type: "tasks",
					icon: <i className="bi-clipboard-fill text-white"></i>,
				},
				{
					type: "resources",
					icon: <i className="bi-cloud-upload-fill text-white"></i>,
				},
				{
					type: "notes",
					icon: <i className="bi-card-text text-white"></i>,
				},
				{
					type: "events",
					icon: <i className="bi-calendar4-event text-white"></i>,
				},
				{
					type: "asks",
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
function Option({ text, indent_level, url, access_denied, context }) {
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
				{access_denied === true ? (
					<i className="bi-lock-fill" />
				) : (
					<>
						{context === "packs" && <i className="bi-box-fill" />}
						{context === "notes" && <i className="bi-card-text" />}
						{context === "tasks" && <i className="bi-clipboard-fill" />}
						{context === "resources" && <i className="bi-cloud-download-fill" />}
						{context === "asks" && <i className="bi-patch-question-fill" />}
					</>
				)}
			</div>
			<span>{text}</span>
		</div>
	);
}
export const PrimarySideBar = () => {
	var { current_surface_cache } = useContext(UnifiedHandlerClientContext);
	var [options, set_options] = useState();
	var loc = useLocation();
	function censor_tree(tree) {
		//it checks each option and censors it if this user is not a collaborator of
		//censor means that option is disabled and nothing about that option is visible

		return JSON.parse(JSON.stringify(tree)).map((option) => {
			if (
				check_being_collaborator(
					global_data.all[option.context].find((row) => row._id === option.id),
					window.localStorage.getItem("user_id")
				)
			) {
				return option;
			} else {
				/* console.log(
					"row is",
					global_data.all[option.context].find((row) => row._id === option.id),
					`${window.localStorage.getItem("user_id")}`,
					"is not a collaborator of"
				); */
				return {
					...option,
					text: `access denied ! (${option.context.slice(0, option.context.length - 1)})`,
					access_denied: true,
				};
			}
		});
	}
	function create_downside_tree({ context, id, pack_id, indent_level }) {
		//possible values for context : any unit
		//it returns an array of options (with correct order and indentation and ready to be rendered )

		if (["tasks", "notes", "resources", "asks"].includes(context)) {
			return [
				{
					text: `${
						global_data.all[context].find((item) => item._id === id)[
							context === "asks" ? "question" : "title"
						]
					}`,

					url: `/dashboard/${context}/${id}`,
					context,
					id,
					pack_id,
					indent_level,
				},
			];
		} else if (context === "packs") {
			var tmp = [
				{
					text: `${global_data.all.packs.find((pack) => pack._id === id).title}`,
					url: `/dashboard/packs/${id}`,
					context: "packs",
					id,
					pack_id,
					indent_level,
				},
			];
			tmp = tmp.concat(
				global_data.all.tasks
					.filter((task) => task.pack_id === id)
					.map((task) => {
						return {
							text: `${
								global_data.all.tasks.find((task) => task._id === task._id).title
							}`,
							url: `/dashboard/tasks/${task._id}`,
							context: "tasks",
							id: task._id,
							pack_id,
							indent_level: indent_level + 1,
						};
					})
			);
			tmp = tmp.concat(
				global_data.all.resources
					.filter((resource) => resource.pack_id === id)
					.map((resource) => {
						return {
							text: `${
								global_data.all.resources.find((item) => item._id === resource._id)
									.title
							}`,
							url: `/dashboard/resources/${resource._id}`,
							context: "resources",
							id: resource._id,
							pack_id,
							indent_level: indent_level + 1,
						};
					})
			);
			tmp = tmp.concat(
				global_data.all.notes
					.filter((note) => note.pack_id === id)
					.map((note) => {
						return {
							text: `${
								global_data.all.notes.find((item) => item._id === note._id).title
							}`,
							url: `/dashboard/notes/${note._id}`,
							context: "notes",
							id: note._id,
							pack_id,
							indent_level: indent_level + 1,
						};
					})
			);
			tmp = tmp.concat(
				global_data.all.asks
					.filter((ask) => ask.pack_id === id)
					.map((ask) => {
						return {
							text: `${
								global_data.all.asks.find((item) => item._id === ask._id).question
							}`,
							url: `/dashboard/asks/${ask._id}`,
							context: "asks",
							id: ask._id,
							pack_id,
							indent_level: indent_level + 1,
						};
					})
			);
			global_data.all.packs
				.filter((pack) => pack.pack_id === id)
				.forEach((pack) => {
					tmp = tmp.concat(
						create_downside_tree({
							context: "packs",
							id: pack._id,
							pack_id: pack.pack_id,
							indent_level: indent_level + 1,
						})
					);
				});
			return tmp;
		}
	}
	function create_full_tree(context, id) {
		//possible values for context : any unit
		if (global_data.all[context].find((i) => i._id === id).pack_id) {
			var latest_found_parent = global_data.all[context].find((i) => i._id === id).pack_id;
			while (global_data.all.packs.find((pack) => pack._id === latest_found_parent).pack_id) {
				latest_found_parent = global_data.all.packs.find(
					(pack) => pack._id === latest_found_parent
				).pack_id;
			}
			return create_downside_tree({
				context: "packs",
				id: latest_found_parent,
				pack_id: global_data.all.packs.find((pack) => pack._id === latest_found_parent)
					.pack_id,
				indent_level: 0,
			});
		} else {
			return create_downside_tree({
				context,
				id,
				pack_id: global_data.all[context].find((item) => item._id === id).pack_id,
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
	async function get_data() {
		var trees = [];
		global_data.user.tasks.forEach((task) => {
			trees.push(create_full_tree("tasks", task._id));
		});

		global_data.user.notes.forEach((note) => {
			trees.push(create_full_tree("notes", note._id));
		});

		global_data.user.resources.forEach((resource) => {
			trees.push(create_full_tree("resources", resource._id));
		});

		global_data.user.packs.forEach((pack) => {
			trees.push(create_full_tree("packs", pack._id));
		});
		global_data.user.asks.forEach((ask) => {
			trees.push(create_full_tree("asks", ask._id));
		});
		set_options(censor_tree(custom_find_unique(trees, compare_custom_trees).flat()));
	}
	useEffect(() => {
		get_data();
	}, [global_data, loc]);
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
