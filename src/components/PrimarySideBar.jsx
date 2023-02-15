import { AddTask, Backpack, CloudUpload, NoteAdd } from "@mui/icons-material";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { check_being_collaborator, custom_find_unique } from "../../common_helpers";
import { GlobalDataContext } from "../GlobalDataContext";
function Option({ text, indent_level, url }) {
	var nav = useNavigate();
	var is_selected = useMatch(url);
	return (
		<div
			className={[
				"border-t border-b border-black flex  items-center w-full",
				is_selected ? "bg-blue-600 text-white" : "",
			].join(" ")}
			style={{ paddingLeft: indent_level * 20 + "px" }}
			onClick={() => nav(url)}
		>
			{text}
		</div>
	);
}
function AddNewOptionRow() {
	var nav = useNavigate();
	function onclick_handler(type) {
		/* 
		possible values for type : "packs" , "resources" , "notes" , "tasks"
		if type === "packs" it means create a new pack and the same for others
		*/

		var { pathname } = window.location;
		if (pathname.startsWith("/dashboard/packs") && pathname !== "/dashboard/packs/new") {
			nav(`/dashboard/${type}/new?pack_id=${pathname.split("/")[3]}`);
		} else {
			nav(`/dashboard/${type}/new`);
		}
	}
	return (
		<div className="flex justify-around bg-white p-1">
			<button onClick={() => onclick_handler("packs")}>
				<Backpack sx={{ color: "blue" }} />
			</button>
			<button onClick={() => onclick_handler("tasks")}>
				<AddTask sx={{ color: "blue" }} />
			</button>
			<button onClick={() => onclick_handler("resources")}>
				<CloudUpload sx={{ color: "blue" }} />
			</button>
			<button onClick={() => onclick_handler("notes")}>
				<NoteAdd sx={{ color: "blue" }} />
			</button>
		</div>
	);
}

export const PrimarySideBar = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var user_id = localStorage.getItem("user_id");
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
					text: `hidden ${option.context.slice(0, option.context.length - 1)}`,
				};
			}
		});
	}
	function create_downside_tree({ context, id, pack_id, indent_level }) {
		//possible values for context : packs , tasks , resources , notes
		//it returns an array of options (with correct order and indentation and ready to be rendered )

		if (["tasks", "notes", "resources"].includes(context)) {
			return [
				{
					text: `${context.slice(0, context.length - 1)} : ${
						global_data.all[context].find((item) => item._id === id).title
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
					text: `pack : ${global_data.all.packs.find((pack) => pack._id === id).title}`,
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
							text: `task :  ${global_data.all.tasks.find(
								(task) => task._id === task._id
							)}`,
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
							text: `resource : ${
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
							text: `note : ${
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
		//possible values for context : packs , tasks , resources , notes
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

		set_options(censor_tree(custom_find_unique(trees, compare_custom_trees).flat()));
	}
	useEffect(() => {
		get_data();
	}, [loc]);
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
