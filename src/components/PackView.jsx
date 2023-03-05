import React, { useContext } from "react";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
function PackViewNote({ note }) {
	return <div className="border border-blue-500 rounded">{JSON.stringify(note)}</div>;
}
function PackViewResource({ resource }) {
	return <div className="border border-blue-500">{JSON.stringify(resource)}</div>;
}
function PackViewTask({ task }) {
	return <div className="border border-blue-500">{JSON.stringify(task)}</div>;
}
function PackViewPack({ pack }) {
	//its used to show an overview of a pack inside another pack
	return <div className="border border-blue-500">{JSON.stringify(pack)}</div>;
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
				{pack_children
					.filter((child) => child.context === "packs")
					.map((i) => (
						<PackViewPack pack={i.child} key={i.child._id} />
					))}
			</Section>
			<Section title="tasks">
				{pack_children
					.filter((child) => child.context === "tasks")
					.map((i) => (
						<PackViewTask task={i.child} key={i.child._id} />
					))}
			</Section>
			<Section title="notes">
				{pack_children
					.filter((child) => child.context === "notes")
					.map((i) => (
						<PackViewNote note={i.child} key={i.child._id} />
					))}
			</Section>
			<Section title="resources">
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
	return (
		<div className="border border-blue-400 p-2">
			<h1>PackView</h1>
			{view_id !== undefined ? (
				<CustomPackView {...{ pack_children, view_id }} />
			) : (
				<DefaultPackView {...{ pack_children }} />
			)}
		</div>
	);
};
