import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { new_comment as api_new_comment, edit_comment, delete_comment } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
const CommentSBox = ({ user_id }) => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var urlParams = useParams();
	var current_field = Object.keys(urlParams)[0];
	if (current_field === "task_id") {
		var current_context = "tasks";
	} else if (current_field === "note_id") {
		var current_context = "notes";
	} else if (current_field === "resource_id") {
		var current_context = "resources";
	} else if (current_field === "pack_id") {
		current_context = "packs";
	}

	var comments = [];
	function get_comments_of_pack(pack_id) {
		//it doesnt just return direct comments of this pack
		//it also returns comments of its children recursively
		var tmp = [];

		tmp = [
			...tmp,
			...global_data.all.comments.filter((comment) => comment.pack_id === pack_id),
		];

		//adding comments of tasks and resources and notes which are direct children of this pack
		tmp = [
			...tmp,
			...global_data.all.comments.filter((comment) => {
				if (comment.task_id) {
					return (
						global_data.all.tasks.find((task) => task._id === comment.task_id)
							.pack_id === pack_id
					);
				} else if (comment.resource_id) {
					return (
						global_data.all.resources.find(
							(resource) => resource._id === comment.resource_id
						).pack_id === pack_id
					);
				} else if (comment.note_id) {
					return (
						global_data.all.notes.find((note) => note._id === comment.note_id)
							.pack_id === pack_id
					);
				}
			}),
		];

		tmp = [
			...tmp,
			...global_data.all.packs
				.filter((pack) => pack.pack_id === pack_id)
				.map((pack) => get_comments_of_pack(pack._id))
				.flat(),
		];
		return tmp;
	}
	function get_comments() {
		//returns all comments of this context recursively
		var context = current_context;
		if (context === "tasks" || context === "notes" || context === "resources") {
			//for example if content === "tasks" it returns comments of that task
			return global_data.all.comments.filter(
				(comment) => comment[current_field] === urlParams[current_field]
			);
		} else if (context === "packs") {
			return get_comments_of_pack(urlParams["pack_id"]);
		}
	}
	useEffect(() => get_comments(), []);
	const edit_comment_handler = async (comment_id) => {
		await edit_comment({
			new_text: window.prompt("enter new text for this comment :"),
			comment_id,
		});
		get_global_data();
	};
	async function new_comment() {
		var tmp = {
			date: new Date().getTime(),
			text: document.getElementById("new_comment_text_input").value,
			user_id,
		};
		tmp[current_field] = urlParams[current_field];
		await new_comment(tmp);
		get_global_data();
	}
	const deleteHandler = async (comment_id) => {
		await delete_comment({
			filters: {
				_id: comment_id,
			},
		});
		get_global_data();
	};
	if (comments === null) return <h1>loading ... </h1>;
	return (
		<div className="comments-box-container">
			{comments.map((comment) => (
				<div className="" key={comment._id}>
					<span>{comment.text}</span>
					<button onClick={() => deleteHandler(comment._id)}>delete</button>
					<button onClick={() => edit_comment_handler(comment._id)}>edit</button>
				</div>
			))}

			<input placeholder="enter a comment" id="new_comment_text_input" />
			<button onClick={new_comment}></button>
		</div>
	);
};

export default CommentSBox;
