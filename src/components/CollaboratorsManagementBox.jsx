import { PersonRounded } from "@mui/icons-material";
import React, { useContext } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { get_collection, update_document } from "../../api/client";
import { Section } from "./section.jsx";
import Select from "react-select";
import { GlobalDataContext } from "../GlobalDataContext";
function OptionsSection({ collaborators, id, context }) {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var all_users = global_data.all.users;
	var [selected_collaborators, set_selected_collaborators] = useState(null);
	function add_new_collaborators() {
		update_document({
			collection: context,
			update_filter: {
				_id: id,
			},
			update_set: {
				collaborators: [
					...collaborators,
					...selected_collaborators.map((i) => {
						return { user_id: i.value, is_owner: false };
					}),
				],
			},
		})
			.then(
				(i) => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong ! details in console.");
				}
			)
			.finally(get_global_data);
	}
	return (
		<>
			<Section title="options">
				<h1>adding new collaborators</h1>
				<p>
					select users that you want to add as new collaborators of this{" "}
					{context.slice(0, context.length - 1)} and hit the submit button :
				</p>
				<Select
					onChange={set_selected_collaborators}
					value={selected_collaborators}
					options={[
						...all_users
							.filter(
								(user) => !collaborators.map((i) => i.user_id).includes(user._id)
							)
							.map((user) => {
								return {
									value: user._id,
									label: `@${user.username}`,
								};
							}),
					]}
					isMulti
					isSearchable
				/>
				<button
					className="border border-stone-600 rounded mt-2 px-2"
					onClick={add_new_collaborators}
				>
					add these new collaborators
				</button>
			</Section>
		</>
	);
}
export const CollaboratorsManagementBox = ({ context, id }) => {
	//for example if you want to show collaborators of a workspace with id "blah" : context : "workspaces" , id : "blah"
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var collaborators = global_data.all[context]
		.find((i) => i._id === id)
		["collaborators"].map((collaborator) => {
			return {
				...collaborator,
				user_document: global_data.all.users.find(
					(user) => user._id === collaborator.user_id
				),
			};
		});
	async function remove_collaborator_handler(collaborator_id) {
		if (!window.confirm("are you sure?")) return;
		await update_document({
			collection: context,
			update_filter: {
				_id: id,
			},
			update_set: {
				collaborators: (
					await get_collection({
						collection_name: context,
						filters: { _id: id },
						global_data,
					})
				)[0]["collaborators"].filter((i) => i.user_id !== collaborator_id),
			},
		});
		alert("done!");
		get_global_data();
	}
	async function make_a_user_owner(collaborator) {
		//it makes collaborator which is passed in the first parameter admin

		if (
			!window.confirm(
				"now you are owner but if you do this action you become an admin and this user with be owner. do you want to continue ? "
			)
		) {
			return;
		}
		await update_document({
			collection: context,
			update_filter: {
				_id: id,
			},
			update_set: {
				collaborators: [
					...collaborators.filter(
						(i) =>
							i.user_id !== collaborator.user_id &&
							i.user_id !== window.localStorage.getItem("user_id")
					),
					{ user_id: collaborator.user_id, is_owner: true },
					{ user_id: window.localStorage.getItem("user_id"), is_owner: false },
				],
			},
		});

		get_global_data();
	}
	return (
		<Section title="Collaborators Management Box">
			<Section title="current collaborators">
				{collaborators.map((collaborator, index) => {
					var logged_in_user = collaborators.find(
						(coll) => coll.user_id === window.localStorage.getItem("user_id")
					);
					return (
						<div
							key={index}
							className="h-16 flex items-center space-x-4 flex-1 overflow-scroll"
						>
							<h1>#{index + 1}</h1>
							{collaborator.user_document.profile_image ? (
								<img
									className="h-14 w-14 rounded-full"
									src={`${window.API_ENDPOINT}/profile_images/${collaborator.user_document.profile_image}`}
								/>
							) : (
								<PersonRounded className="h-14 w-14 bg-white" />
							)}
							<p>
								username :{" "}
								{collaborator.user_document.username ? (
									<Link to={`/users/${collaborator.user_id}`}>
										@{collaborator.user_document.username}
									</Link>
								) : (
									<p>undefined</p>
								)}
							</p>
							<p>is_owner : {collaborator.is_owner === true ? "true" : "false"}</p>
							{logged_in_user.is_owner &&
								collaborator.user_id !== logged_in_user.user_id && (
									<>
										<button
											onClick={() =>
												remove_collaborator_handler(collaborator.user_id)
											}
										>
											remove collaborator
										</button>
										<button onClick={() => make_a_user_owner(collaborator)}>
											make this user admin
										</button>
									</>
								)}
						</div>
					);
				})}
			</Section>
			<OptionsSection collaborators={collaborators} context={context} id={id} />
		</Section>
	);
};
