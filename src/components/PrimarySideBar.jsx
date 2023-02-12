import React, { Fragment, useContext, useEffect } from "react";
import { useState } from "react";
import { useLocation, useMatch, useNavigate, useParams } from "react-router-dom";
import { get_user_data_hierarchy } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
function Option({ text, indent_count, url }) {
	var nav = useNavigate();
	var is_selected = useMatch(url);
	return (
		<div
			className={[
				"border-t border-b border-black flex  items-center w-full",
				is_selected ? "bg-blue-600 text-white" : "",
			].join(" ")}
			style={{ paddingLeft: indent_count * 20 + "px" }}
			onClick={() => nav(url)}
		>
			{text}
		</div>
	);
}

export const PrimarySideBar = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var user_id = localStorage.getItem("user_id");
	var [options, set_options] = useState();
	var loc = useLocation();
	async function get_data() {
		set_options([
			...global_data.user.tasks.map((task) => {
				return {
					text: `task : ${task.title}`,
					indent_count: 0,
					url: `/dashboard/tasks/${task._id}`,
				};
			}),
			...global_data.user.resources.map((resource) => {
				return {
					text: `resource : ${resource.title}`,
					indent_count: 0,
					url: `/dashboard/resources/${resource._id}`,
				};
			}),
			...global_data.user.notes.map((note) => {
				return {
					text: `note : ${note.title}`,
					indent_count: 0,
					url: `/dashboard/notes/${note._id}`,
				};
			}),
			...global_data.user.packs.map((pack) => {
				return {
					text: `pack : ${pack.title}`,
					indent_count: 0,
					url: `/dashboard/packs/${pack._id}`,
				};
			}),
		]); // each option should contain all required props of Option component
	}
	useEffect(() => {
		get_data();
	}, [loc]);
	if (options == null) {
		return "loading options ...";
	}
	return (
		<>
			{options.map((option, index) => {
				return (
					<Fragment key={index}>
						<Option {...option} />
					</Fragment>
				);
			})}
		</>
	);
};
