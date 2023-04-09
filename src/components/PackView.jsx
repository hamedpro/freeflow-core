import React, { Fragment, useContext } from "react";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
import editor_js_to_html from "editorjs-html";
import parse from "html-react-parser";
import { useNavigate, useParams } from "react-router-dom";
import { Item, Menu, useContextMenu } from "react-contexify";
import { renderToString } from "react-dom/server";
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
		var editor_js_to_html_parser = editor_js_to_html({
			table: (block) => {
				if (block.data.content.length === 0) <b>[empty table]</b>;
				return renderToString(
					<table>
						<thead>
							<tr>
								{block.withHeadings &&
									block.data.content[0].map((i, index) => (
										<th key={index}>{i}</th>
									))}
							</tr>
							<tr>
								{!block.withHeadings &&
									block.data.content[0].map((i, index) => (
										<td key={index}>{i}</td>
									))}
							</tr>
						</thead>
						<tbody>
							{block.data.content
								.slice(1, block.data.content.length)
								.map((i, index1) => (
									<tr key={index1}>
										{i.map((i, index2) => (
											<td key={index2}>{i}</td>
										))}
									</tr>
								))}
						</tbody>
					</table>
				);
			},
			checklist: (block) => {
				return renderToString(
					<>
						{block.data.items.map((i, index) => (
							<Fragment key={index}>
								<i className={i.checked ? "bi-toggle-on" : "bi-toggle-off"} />
								{i.text}
								<br />
							</Fragment>
						))}
					</>
				);
			},
		});
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
				{last_note_commit_as_html}
			</Section>
		);
	}
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
	var { show } = useContextMenu({
		id: "pack_view_options_context_menu",
	});
	return (
		<>
			<Menu id="pack_view_options_context_menu">
				<Item
					id="edit_pack_view"
					onClick={() => {
						if (view_id === undefined) {
							alert("only user created pack views are editable.");
							return;
						}
						nav(`/dashboard/edit_pack_view?pack_view_id=${view_id}&pack_id=${pack_id}`);
					}}
				>
					Edit Pack View
				</Item>
			</Menu>
			<div className="border border-blue-400 mt-2">
				<div className="flex justify-between mb-1 items-center">
					<h1>pack view : {view_id !== undefined && `(#${view_id})`} </h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>

				{view_id !== undefined ? (
					<CustomPackView {...{ pack_children, view_id }} />
				) : (
					<DefaultPackView {...{ pack_children }} />
				)}
			</div>
		</>
	);
};
