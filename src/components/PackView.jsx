import React, { useContext } from "react";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
import editor_js_to_html from "editorjs-html";
import parse from "html-react-parser";
import { useNavigate, useParams } from "react-router-dom";
import ObjectBox from "./ObjectBox";
function PackViewNote({ note }) {
	var nav = useNavigate();

	var { global_data } = useContext(GlobalDataContext);

	var latest_note_commit = global_data.all.note_commits
		.filter((i) => i.note_id === note._id)
		.sort((i1, i2) => i1.time - i2.time)
		.at(-1);
	if (latest_note_commit === undefined) {
		return (
			<div
				className="overflow-auto   cursor-pointer border border-blue-400 rounded "
				onClick={() => nav(`/dashboard/notes/${note._id}`)}
			>
				<h1>showing note {note._id} : there is not any note commit for this note </h1>
			</div>
		);
	} else {
		var editor_js_to_html_parser = editor_js_to_html();
		var last_note_commit_as_html = parse(
			editor_js_to_html_parser
				.parse(latest_note_commit.data)
				.map((i) => {
					if (typeof i === "string") {
						return i;
					} else {
						return `<p>converting this block to html is not supported yet</p>`;
					}
				})
				.join("")
		);
		return (
			<div
				className="overflow-auto   cursor-pointer border border-blue-500"
				onClick={() => nav(`/dashboard/notes/${note._id}`)}
			>
				<h1>showing note {note._id} </h1>
				{last_note_commit_as_html}
			</div>
		);
	}
}
function PackViewResource({ resource }) {
	var nav = useNavigate();

	return (
		<div
			className="overflow-auto   border border-blue-500 cursor-pointer "
			onClick={() => nav(`/dashboard/resources/${resource._id}`)}
		>
			resource {resource._id} :
			<ObjectBox object={resource} />
		</div>
	);
}
function PackViewTask({ task }) {
	var nav = useNavigate();
	return (
		<div
			className="overflow-auto   border border-blue-500 cursor-pointer "
			onClick={() => nav(`/dashboard/tasks/${task._id}`)}
		>
			task {task._id}:
			<ObjectBox object={task} />
		</div>
	);
}
function PackViewPack({ pack }) {
	var nav = useNavigate();
	//its used to show an overview of a pack inside another pack
	return (
		<div
			className="overflow-auto   border border-blue-500 cursor-pointer "
			onClick={() => nav(`/dashboard/packs/${pack._id}`)}
		>
			pack {pack._id} :
			<ObjectBox object={pack} />
		</div>
	);
}
export function PackViewItem({ thing, context }) {
	if (context === "packs") {
		return <PackViewPack pack={thing.child} />;
	} else if (context === "tasks") {
		return <PackViewTask task={thing.child} />;
	} else if (context === "resources") {
		return <PackViewResource resource={thing.child} />;
	} else if (context === "notes") {
		return <PackViewNote note={thing.child} />;
	}
}
function DefaultPackView({ pack_children }) {
	return (
		<>
			<Section title="packs">
				{pack_children.filter((child) => child.context === "packs").length === 0 && (
					<h1>there is not any pack here to show </h1>
				)}
				{pack_children
					.filter((child) => child.context === "packs")
					.map((i) => (
						<PackViewPack pack={i.child} key={i.child._id} />
					))}
			</Section>
			<Section title="tasks">
				{pack_children.filter((child) => child.context === "tasks").length === 0 && (
					<h1>there is not any task here to show </h1>
				)}
				{pack_children
					.filter((child) => child.context === "tasks")
					.map((i) => (
						<PackViewTask task={i.child} key={i.child._id} />
					))}
			</Section>
			<Section title="notes">
				{pack_children.filter((child) => child.context === "notes").length === 0 && (
					<h1>there is not any note here to show </h1>
				)}
				{pack_children
					.filter((child) => child.context === "notes")
					.map((i) => (
						<PackViewNote note={i.child} key={i.child._id} />
					))}
			</Section>
			<Section title="resources">
				{pack_children.filter((child) => child.context === "resources").length === 0 && (
					<h1>there is not any resource here to show </h1>
				)}
				{pack_children
					.filter((child) => child.context === "resources")
					.map((i) => (
						<PackViewResource resource={i.child} key={i.child._id} />
					))}
			</Section>
		</>
	);
}
function CustomPackView({ pack_children, view_id }) {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var view_order = global_data.all.pack_views.find(
		(pack_view) => pack_view._id === view_id
	).order;
	return view_order.map(({ unit_context, id }) => (
		<PackViewItem
			key={unit_context + id}
			thing={pack_children.find((i) => i.child._id === id)}
			context={unit_context}
		/>
	));
}
export const PackView = ({ pack_children, view_id }) => {
	//if view_id is undefined we
	//show tasks, units, ... separately inside boxes
	//but if a view_id is there we get order property of that view
	//from database and show pack_children in that order
	//schema of pack_views collection : {_id  ,name : string , pack_id : string , order :[{id : string , unit_context : string }]}
	var nav = useNavigate();
	var { pack_id } = useParams();
	return (
		<div className="border border-blue-400 p-2">
			<h1>pack view : </h1>
			{view_id !== undefined ? (
				<>
					<button
						onClick={() =>
							nav(
								`/dashboard/edit_pack_view?pack_view_id=${view_id}&pack_id=${pack_id}`
							)
						}
					>
						edit this pack view{" "}
					</button>
					<CustomPackView {...{ pack_children, view_id }} />
				</>
			) : (
				<DefaultPackView {...{ pack_children }} />
			)}
		</div>
	);
};
