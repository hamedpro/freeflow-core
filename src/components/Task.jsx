import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { custom_delete, leave_here, update_document } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { MessagesBox } from "./MessagesBox";
import ObjectBox from "./ObjectBox";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
export const Task = () => {
	var nav = useNavigate();
	var { task_id } = useParams();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);

	var task = global_data.all.tasks.find((i) => i._id === task_id);
	if (task === undefined) {
		return <h1>that task you are looking for doesn't even exist</h1>;
	} else if (!task.collaborators.map((i) => i.user_id).includes(user_id)) {
		return <h1>access denied! you are not a collaborator of this task </h1>;
	}
	async function change_task_handler(type) {
		if (task.collaborators.map((i) => i.user_id).includes(user_id) !== true) {
			alert("access denied! to do this you must be a collaborator of this task ");
			return;
		}
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "tasks",
			update_filter: {
				_id: task_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_task() {
		if (task.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		if (!window.confirm("are you sure you want to leave here ?")) return;
		leave_here({ user_id, context: "tasks", context_id: task_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_task() {
		if (task.collaborators.find((i) => i.user_id === user_id).is_owner !== true) {
			alert("access denied! only owner of this task can do this.");
			return;
		}
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "tasks",
			id: task_id,
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
		<div>
			<h1>Task</h1>
			<Section title="options">
				<div className="flex flex-col space-y-2">
					<StyledDiv onClick={() => change_task_handler("title")}>
						change title of this task
					</StyledDiv>
					<StyledDiv onClick={() => change_task_handler("description")}>
						change description of this task
					</StyledDiv>
					<StyledDiv onClick={leave_this_task}>leave this task </StyledDiv>
					<StyledDiv onClick={delete_this_task}>delete this task</StyledDiv>
				</div>
			</Section>
			<CollaboratorsManagementBox context={"tasks"} id={task_id} />
			<ObjectBox object={task} />
			<MessagesBox />
		</div>
	);
};
