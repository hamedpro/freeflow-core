import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { new_comment as api_new_comment, edit_comment, delete_comment } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
const CommentSBox = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var urlParams = useParams();
	var user_id = window.localStorage.getItem("user_id");
	var tmp = { task_id: "tasks", note_id: "notes", resource_id: "resources", pack_id: "packs" };
	for (var key in tmp) {
		if (key in urlParams) {
			//current_context is either "packs" or "resources" or "notes" or "tasks"
			var current_context = tmp[key];
		}
	}
	var current_field = urlParams[Object.keys(tmp).find((key) => tmp[key] === current_context)];
	var [comments, set_comments] = useState(null);
	function get_comments_of_pack(pack_id) {
		//it doesnt just return direct comments of this pack
		//it also returns comments of its children recursively
		let tmp = global_data.all.comments.filter(
			(comment) => comment.id === pack_id && comment.context === "packs"
		);

		//adding comments of tasks and resources and notes which are direct children of this pack
		tmp = tmp.concat(
			global_data.all.comments.filter((comment) => {
				if (comment.context === "tasks") {
					return (
						global_data.all.tasks.find((task) => task._id === comment.id).pack_id ===
						pack_id
					);
				} else if (comment.context === "resources") {
					return (
						global_data.all.resources.find((resource) => resource._id === comment.id)
							.pack_id === pack_id
					);
				} else if (comment.context === "notes") {
					return (
						global_data.all.notes.find((note) => note._id === comment.id).pack_id ===
						pack_id
					);
				} else {
					return false;
				}
			})
		);
		tmp = tmp.concat(
			global_data.all.packs
				.filter((pack) => pack.pack_id === pack_id)
				.map((pack) => get_comments_of_pack(pack._id))
				.flat()
		);
		return tmp;
	}
	function get_comments() {
		//returns all comments of this context recursively
		if (
			current_context === "tasks" ||
			current_context === "notes" ||
			current_context === "resources"
		) {
			//for example if content === "tasks" it returns comments of that task
			set_comments(
				global_data.all.comments.filter((comment) => comment.id === current_field)
			);
		} else if (current_context === "packs") {
			set_comments(get_comments_of_pack(current_field));
		}
	}
	useEffect(() => {
		get_comments();
	}, [global_data]);
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
		tmp["context"] = current_context;
		tmp["id"] = current_field;
		await api_new_comment(tmp);
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
		<Section title="comments">
			{comments.map((comment) => (
				<div className="" key={comment._id}>
					<span>{comment.text}</span>
					<button onClick={() => deleteHandler(comment._id)}>delete</button>
					<button onClick={() => edit_comment_handler(comment._id)}>edit</button>
				</div>
			))}

			<input placeholder="enter a comment" id="new_comment_text_input" />
			<button onClick={new_comment}>send </button>
		</Section>
	);
};

export default CommentSBox;
