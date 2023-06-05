import React, { useContext } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { calc_units_tree, find_unit_parents } from "../../common_helpers";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

function AddNewOptionRow() {
	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);
	function onclick_handler(type) {
		var { pathname } = window.location;
		var my_regex = /(?:\/)*dashboard\/(?<thing_id>[0-9]+).*$/g;
		var tmp = my_regex.exec(pathname);
		if (tmp) {
			var pack_id =
				cache.find((i) => i.thing_id === Number(tmp.groups.thing_id)).thing.type ===
				"unit/pack"
					? Number(tmp.groups.thing_id)
					: find_unit_parents(cache, Number(tmp.groups.thing_id))[0];
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
				{
					type: "unit/chat",
					icon: <i className="bi-chat-dots-fill text-white" />,
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
					{type === "unit/chat" && <i className="bi-chat-dots-fill" />}
				</>
			</div>
			<span>{text}</span>
		</div>
	);
}
export const PrimarySideBar = () => {
	var { cache } = useContext(UnifiedHandlerClientContext);
	var options = [];
	function render_tree(tree, indent_level) {
		for (var child_id in tree) {
			var i = cache.find((i) => i.thing_id === Number(child_id));
			if (i.thing.type === "unit/pack") {
				options.push({
					url: `/dashboard/${i.thing_id}`,
					type: "unit/pack",
					indent_level,
					text: i.thing.value.title,
					thing_id: i.thing_id,
				});
				render_tree(tree[Number(child_id)], indent_level + 1);
			} else {
				options.push({
					url: `/dashboard/${i.thing_id}`,
					type: i.thing.type,
					indent_level,
					text:
						i.thing.type === "unit/ask" ? i.thing.value.question : i.thing.value.title,
					thing_id: i.thing_id,
				});
			}
		}
	}

	var units_tree = calc_units_tree(cache, undefined);

	render_tree(units_tree, 0);

	return (
		<>
			<AddNewOptionRow />
			{options.map((option, index) => (
				<Option key={index} {...option} />
			))}
		</>
	);
};
