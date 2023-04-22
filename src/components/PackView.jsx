import React, { Fragment, useContext, useRef, useState, useEffect } from "react";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
import { useNavigate, useParams } from "react-router-dom";
import { Item, Menu, useContextMenu } from "react-contexify";
import { custom_editorjs_to_jsx } from "../../jsx_helpers.jsx";
function PackViewNote({ note }) {
	var nav = useNavigate();

	var { global_data } = useContext(GlobalDataContext);

	var latest_note_commit = global_data.all.note_commits
		.filter((i) => i.note_id === note._id)
		.sort((i1, i2) => i1.time - i2.time)
		.at(-1);
	var [last_note_commit_as_jsx, set_last_note_commit_as_jsx] = useState();
	useEffect(() => {
		var async_tmp = async () => {
			if (latest_note_commit !== undefined) {
				set_last_note_commit_as_jsx(await custom_editorjs_to_jsx(latest_note_commit.data));
			}
		};
		async_tmp();
	}, [global_data]);

	return (
		<Section
			title={`note ${note._id}`}
			onClick={() => nav(`/dashboard/notes/${note._id}`)}
			className="cursor-pointer "
		>
			<p>title : {note.title}</p>
			<p>collaborators :</p>
			<ol>
				{note.collaborators.map((c) => (
					<li
						key={c.user_id}
						onClick={(e) => {
							e.stopPropagation();
							nav(`/users/${c.user_id}`);
						}}
					>
						user #{c.user_id}
					</li>
				))}
			</ol>

			<hr />
			{latest_note_commit ? (
				last_note_commit_as_jsx || "loading latest note commit ..."
			) : (
				<h1>showing note {note._id} : there is not any note commit for this note </h1>
			)}
		</Section>
	);
}
function PackViewResource({ resource }) {
	var nav = useNavigate();
	return (
		<Section
			title={`Resource #${resource._id}`}
			onClick={() => nav(`/dashboard/resources/${resource._id}`)}
			className="cursor-pointer "
		>
			<p>title : {resource.title}</p>
			<p>collaborators :</p>
			<ol>
				{resource.collaborators.map((c) => (
					<li
						key={c.user_id}
						onClick={(e) => {
							e.stopPropagation();
							nav(`/users/${c.user_id}`);
						}}
					>
						user #{c.user_id}
					</li>
				))}
			</ol>
			<p>description : {resource.description}</p>
		</Section>
	);
}
function PackViewTask({ task }) {
	var nav = useNavigate();
	return (
		<Section
			title={`task #${task._id}`}
			onClick={() => nav(`/dashboard/tasks/${task._id}`)}
			className="cursor-pointer "
		>
			<p>title : {task.title}</p>
			<p>collaborators :</p>
			<ol>
				{task.collaborators.map((c) => (
					<li
						key={c.user_id}
						onClick={(e) => {
							e.stopPropagation();
							nav(`/users/${c.user_id}`);
						}}
					>
						user #{c.user_id}
					</li>
				))}
			</ol>
			<p>description : {task.description}</p>
		</Section>
	);
}
function PackViewPack({ pack }) {
	//its used to show an overview of a pack inside another pack
	var { global_data } = useContext(GlobalDataContext);
	var nav = useNavigate();
	return (
		<Section
			title={`pack #${pack._id}`}
			onClick={() => nav(`/dashboard/packs/${pack._id}`)}
			className="cursor-pointer "
		>
			<p>title : {pack.title}</p>
			<p>collaborators :</p>
			<ol>
				{pack.collaborators.map((c) => (
					<li
						key={c.user_id}
						onClick={(e) => {
							e.stopPropagation();
							nav(`/users/${c.user_id}`);
						}}
					>
						user #{c.user_id}
					</li>
				))}
			</ol>
			<p>description : {pack.description}</p>

			<ol>
				<li>
					it contains {global_data.all.packs.filter((i) => i.pack_id === pack._id).length}{" "}
					direct packs
				</li>
				<li>
					it contains {global_data.all.notes.filter((i) => i.pack_id === pack._id).length}{" "}
					direct notes
				</li>
				<li>
					it contains{" "}
					{global_data.all.resources.filter((i) => i.pack_id === pack._id).length} direct
					resources
				</li>
				<li>
					it contains {global_data.all.tasks.filter((i) => i.pack_id === pack._id).length}{" "}
					direct tasks
				</li>
			</ol>
		</Section>
	);
}
export function PackViewItem({ thing, context }) {
	if (context === "packs") {
		return <PackViewPack pack={thing} />;
	} else if (context === "tasks") {
		return <PackViewTask task={thing} />;
	} else if (context === "resources") {
		return <PackViewResource resource={thing} />;
	} else if (context === "notes") {
		return <PackViewNote note={thing} />;
	}
}
function GroupedPackView({ pack_children }) {
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
function CustomPackView({ pack_children }) {
	return pack_children.map(({ context, child }) => {
		return <PackViewItem key={context + child._id} thing={child} context={context} />;
	});
}
export const PackView = ({ pack_children, view_as_groups = false, sort }) => {
	//schema of pack_views collection : {_id  ,name : string , pack_id : string , order :[{id : string , unit_context : string }]}

	var nav = useNavigate();
	/* var { pack_id } = useParams(); */
	var sorted_pack_children = pack_children.sort((i1, i2) => {
		if (sort === "timestamp_desc") {
			return i1.child.creation_time - i2.child.creation_time;
		} else if (sort === "timestamp_asce") {
			return -(i1.child.creation_time - i2.child.creation_time);
		}
	});
	return (
		<div className="border border-blue-400 mt-2">
			<div className="flex justify-between mb-1 items-center">
				<h1>
					{view_as_groups
						? "showing data in grouped mode"
						: "showing data without grouping"}{" "}
					{sort === "timestamp_asce" && ", sorting items ascending by time "}
					{sort === "timestamp_desc" && ", sorting items descending by time "}
				</h1>
				<button className="items-center flex" onClick={(event) => show({ event })}>
					<i className="bi-list text-lg" />{" "}
				</button>
			</div>

			{view_as_groups !== true ? (
				<CustomPackView pack_children={sorted_pack_children} />
			) : (
				<GroupedPackView pack_children={sorted_pack_children} />
			)}
		</div>
	);
};
