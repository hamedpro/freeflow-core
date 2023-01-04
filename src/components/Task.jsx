import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import CommentsBox from "./CommentsBox";
import ObjectBox from "./ObjectBox";
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

	return (
		<div>
			<h1>Task</h1>
			<CollaboratorsManagementBox context={"tasks"} id={task_id} />
			<ObjectBox object={task} />
			<CommentsBox user_id={user_id} />
		</div>
	);
};
