import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import CommentsBox from "./CommentsBox";
import ObjectBox from "./ObjectBox";
import { Section } from "./section";
export const Task = () => {
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
		if (task.collaborators.find((i) => i.user_id === user_id).access_level === 1) {
			alert(
				"access denied! to do this you must either be the owner of this task or an admin of that"
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
		if (task.collaborators.find((i) => i.user_id === user_id).access_level === 3) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
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
		if (task.collaborators.find((i) => i.user_id === user_id).access_level !== 3) {
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
				<button onClick={() => change_task_handler("title")}>
					change title of this task
				</button>
				<button onClick={() => change_task_handler("description")}>
					change description of this task{" "}
				</button>
				<button onClick={leave_this_task}>leave this task </button>
				<button onClick={delete_this_task}>delete this task</button>
			</Section>
			<CollaboratorsManagementBox context={"tasks"} id={task_id} />
			<ObjectBox object={task} />
			<CommentsBox user_id={user_id} />
		</div>
	);
};
