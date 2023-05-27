import React, { useContext } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { calc_discoverable_pack_chains, find_unit_parents } from "../../common_helpers";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

function AddNewOptionRow() {
	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);
	function onclick_handler(type) {
		var { pathname } = window.location;
		var my_regex =
			/(?:\/)*dashboard\/(?<thing_context>asks|resources|notes|tasks|events|packs)\/(?<thing_id>[0-9]+).*$/g;
		var tmp = my_regex.exec(pathname);
		if (tmp) {
			var pack_id =
				tmp.groups.thing_context === "packs"
					? tmp.groups.thing_id
					: find_unit_parents(cache, tmp.groups.thing_id)[0];
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
	var { cache } = useContext(UnifiedHandlerClientContext);
	var options = [];
	function add_option(thing_id, indent_level) {
		var i = cache.find((i) => i.thing_id === thing_id);
		if (i.thing.type === "unit/pack") {
			options.push({
				url: `/dashboard/packs/${i.thing_id}`,
				type: "unit/pack",
				indent_level,
				text: i.thing.value.title,
			});
			cache
				.filter((j) => j.thing.value.pack_id === i.thing_id)
				.forEach((j) => {
					add_option(j, indent_level + 1);
				});
		} else {
			options.push({
				url: `/dashboard/${i.thing.type.split("/")[1] + "s"}/${i.thing_id}`,
				type: i.thing.type,
				indent_level,
				text: i.thing.type === "unit/ask" ? i.thing.value.question : i.thing.value.title,
			});
		}
	}

	var discoverable_pack_chains = calc_discoverable_pack_chains(cache);
	discoverable_pack_chains.forEach((chain) => {
		add_option(chain[0], 0);
	});
	//console.log(discoverable_pack_chains);
	cache
		.filter((i) => {
			if (i.thing.type.startsWith("unit/") && i.thing.type !== "unit/pack") {
				if (i.thing.value.pack_id != true) {
					return true;
				} else if (discoverable_pack_chains.flat().includes(i.thing.value.pack_id) !== true) {
					return true;
				}
			}
			return false;
		})
		.forEach((i) => {
			//console.log(i);
			add_option(i.thing_id, 0);
		});

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
