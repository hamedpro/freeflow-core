import React from "react";
import { useParams } from "react-router-dom";
import { new_workspace } from "../../api/client";

const NewWorkspace = () => {
	var { username } = useParams();

	async function submit_new_workspace() {
		var title = document.getElementById("title").value;
		var description = document.getElementById("description").value;
		var collaborators = document.getElementById("collaborators").value.split(","); // an array of usernames
		try {
			await new_workspace({
				creator: username,
				title,
				description,
				collaborators,
				init_date: new Date().getTime(),
			});
			alert("all done!");
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	return (
		<div className="p-2">
			<h1>NewWorkspace</h1>
			<h1>creator : {username}</h1>
			{["title", "description"].map((i, index) => {
				return (
					<React.Fragment key={index}>
						<h1>enter {i} :</h1>
						<input className="border border-blue-400 rounded px-1" id={i} />
					</React.Fragment>
				);
			})}
			<h1>enter workspace collaborators here seperated by comma:</h1>
			<input className="border border-blue-400 rounded px-1 block" id="collaborators" />
			<button onClick={submit_new_workspace}>submit</button>
		</div>
	);
};

export default NewWorkspace;
