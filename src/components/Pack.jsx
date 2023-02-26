import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import CommentSBox from "./CommentsBox";
import ObjectBox from "./ObjectBox";

export const Pack = () => {
	var { pack_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	async function change_note_handler(type) {
		if (!note.collaborators.map((i) => i.user_id).includes(user_id)) {
			alert("access denied! to do this you must be a collaborator of this note ");
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
			collection: "notes",
			update_filter: {
				_id: note_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_note() {
		if (note.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "notes", context_id: note_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_note() {
		if (note.collaborators.find((i) => i.user_id === user_id).is_owner === false) {
			alert("access denied! only owner of this note can do this.");
			return;
		}
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "notes",
			id: note_id,
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
		<div className="p-2">
			<h1>Pack {pack_id}</h1>

			<CollaboratorsManagementBox context="packs" id={pack_id} />
			<h1 className="mt-2">pack data :</h1>
			<ObjectBox
				object={global_data.all.packs.find((pack) => pack._id === pack_id)}
				link={`/dashboard/packs/${pack_id}`}
			/>

			<CommentSBox />
		</div>
	);
};
