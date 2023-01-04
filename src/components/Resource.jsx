import React, { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { download_resource, get_resources } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import ObjectBox from "./ObjectBox";
import { Section } from "./section";

export const Resource = () => {
	var nav = useNavigate();
	var { resource_id } = useParams();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var resource_row = global_data.all.resources.find((i) => i._id === resource_id);
	if (resource_row === undefined) {
		return <h1>resource you are looking for doesn't even exist</h1>;
	} else if (resource_row.collaborators.map((i) => i.user_id).includes(user_id) !== true) {
		return <h1>access denied! you are not a collaborator of this resource</h1>;
	}
	async function change_resource_handler(type) {
		if (resource_row.collaborators.find((i) => i.user_id === user_id).access_level === 1) {
			alert(
				"access denied! to do this you must either be the owner of this resource or an admin of that"
			);
			return;
		}
		var user_input = window.prompt(`enter new value for ${type}`);
		if (!user_input) {
			alert("you cancelled or your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "resources",
			update_filter: {
				_id: resource_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_resource() {
		if (resource_row.collaborators.find((i) => i.user_id === user_id).access_level === 3) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "resources", context_id: resource_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_resource() {
		if (resource_row.collaborators.find((i) => i.user_id === user_id).access_level !== 3) {
			alert("access denied! only owner of this resource can do this.");
			return;
		}
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "resources",
			id: resource_id,
		})
			.then(
				(i) => {
					alert("all done");
					nav(`/dashboard`);
				},
				(error) => {
					console.log(error);
					alert("something went wrong! details in console");
				}
			)
			.finally(get_global_data);
	}
	return (
		<>
			<h1>resource</h1>
			<Section title="options">
				<button onClick={() => change_resource_handler("title")}>
					change title of this resource
				</button>
				<button onClick={() => change_resource_handler("description")}>
					change description of this resource
				</button>
				<button onClick={leave_this_resource}>leave this resource</button>
				<button onClick={delete_this_resource}>delete this resource</button>
			</Section>
			<CollaboratorsManagementBox context={"resources"} id={resource_id} />
			<ObjectBox object={resource_row} />
			<button onClick={() => download_resource({ resource_id: resource_row._id })}>
				download this resource
			</button>
		</>
	);
};
