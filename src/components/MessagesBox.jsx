import { useContext } from "react";
import { update_document, new_document, delete_document } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
export function MessagesBox() {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var { pathname } = window.location;
	function get_hierarchy_unit_context_and_id(unit_context, unit_id) {
		//how it works :
		// if you pass "packs" , "foo" to it
		// it finds that unit and all its nested childrens recursively
		//and maps every unit to an object like this : {unit_context , unit_id }
		//and returns an array containing those objects

		if (["resources", "notes", "tasks", "events"].includes(unit_context)) {
			return [{ unit_context, unit_id }];
		} else if (unit_context === "packs") {
			return [
				...["resources", "notes", "tasks", "events"]
					.map((i) => {
						return global_data.all[i]
							.filter((j) => j.pack_id === unit_id)
							.map((j) => get_hierarchy_unit_context_and_id(i, j._id))
							.flat();
					})
					.flat(),
				{ unit_context: "packs", unit_id },
			];
		}
	}
	var regex_result =
		/(?:\/)*dashboard\/(?<unit_context>packs|events|notes|resources|tasks)\/(?<unit_id>[0-9A-Fa-f]{24})(?:\/)*$/g.exec(
			pathname
		);
	var messages_to_show = get_hierarchy_unit_context_and_id(
		regex_result.groups.unit_context,
		regex_result.groups.unit_id
	)
		.map((i) =>
			global_data.all.messages.filter(
				(message) =>
					message.unit_context === i.unit_context && message.unit_id === i.unit_id
			)
		)
		.flat();
	const edit_message_handler = async (message_id) => {
		await update_document({
			collection: "messages",
			update_filter: {
				_id: message_id,
			},
			update_set: {
				text: window.prompt("enter new text for this message :"),
			},
		});
		get_global_data();
	};
	async function new_message() {
		await new_document({
			collection_name: "messages",
			document: {
				submit_time: new Date().getTime(),
				text: document.getElementById("new_comment_text_input").value,
				user_id: window.localStorage.getItem("user_id"),
				unit_context: regex_result.groups.unit_context,
				unit_id: regex_result.groups.unit_id,
			},
		});
		get_global_data();
	}
	const delete_message_handler = async (message_id) => {
		await {
			filters: {
				_id: message_id,
			},
		};
		await delete_document({
			collection_name: "messages",
			filters: {
				_id: message_id,
			},
		});
		get_global_data();
	};
	return (
		<Section title="messages">
			{messages_to_show.map((message) => (
				<div
					key={message._id}
					className={`relative w-full flex ${
						message.user_id === window.localStorage.getItem("user_id")
							? "justify-start"
							: "justify-end"
					}`}
				>
					<div className="border border-blue-500 w-1/2 h-full mb-2 rounded p-2">
						<p className="mb-2">{message.text}</p>

						<StyledDiv
							className="w-fit mb-1 inline mx-1"
							onClick={() => delete_message_handler(message._id)}
						>
							delete
						</StyledDiv>
						<StyledDiv
							className="w-fit mb-1 inline mx-1"
							onClick={() => edit_message_handler(message._id)}
						>
							edit
						</StyledDiv>
						<p>
							written by{" "}
							{
								global_data.all.users.find((user) => user._id === message.user_id)
									.username
							}{" "}
							| {new Date(message.submit_time).toString()}
						</p>
					</div>
				</div>
			))}
			<hr />
			<input
				placeholder="enter a comment"
				className="mt-2 mx-2 px-1"
				id="new_comment_text_input"
			/>
			<button onClick={new_message}>send</button>
		</Section>
	);
}
