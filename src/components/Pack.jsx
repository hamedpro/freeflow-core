import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { custom_delete, leave_here, update_document } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { MessagesBox } from "./MessagesBox";
import ObjectBox from "./ObjectBox";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { PackRootChildUnit } from "./PackRootChildUnit";
import { PackView } from "./PackView";
import Select from "react-select";
export const Pack = () => {
	var { pack_id } = useParams();
	var user_id = window.localStorage.getItem("user_id");
	var nav = useNavigate();

	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var pack = global_data.all.packs.find((pack) => pack._id === pack_id);
	if (pack === undefined) {
		return <h1>there is not any pack with that id </h1>;
	}
	/* if (pack.collaborators.map((i) => i.user_id).includes(user_id) !== true) {
		return <h1>access denied! :that pack was found but you are not a collaborator of that </h1>;
	} */

	//pack_children only includes direct children of this pack and not its grandchildren
	//items of this array look like this :
	//{ context: "notes" | "tasks" | "resources" | "packs" , child : that document }

	var pack_children = [];
	["packs", "resources", "notes", "tasks"].forEach((key) => {
		pack_children = pack_children.concat(
			global_data.all[key]
				.filter((i) => i.pack_id === pack._id)
				.map((i) => ({ context: key, child: i }))
		);
	});
	async function change_pack_handler(type) {
		/* if (!pack.collaborators.map((i) => i.user_id).includes(user_id)) {
			alert("access denied! to do this you must be a collaborator of this pack ");
			return;
		} */
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "packs",
			update_filter: {
				_id: pack_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_pack() {
		if (pack.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "packs", context_id: pack_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_pack() {
		/* if (pack.collaborators.find((i) => i.user_id === user_id).is_owner === false) {
			alert("access denied! only owner of this pack can do this.");
			return;
		} */
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "packs",
			id: pack_id,
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
	var [selected_view, set_selected_view] = useState({
		value: undefined,
		label: "default view mode",
	});
	var nav = useNavigate();
	return (
		<div className="p-2">
			<h1>Pack {pack_id}</h1>
			<StyledDiv className="mb-2" onClick={() => nav("new_pack_view")}>
				new pack view
			</StyledDiv>
			<Select
				options={[
					{ value: undefined, label: "default view mode" },
					...global_data.all.pack_views
						.filter((pack_view) => pack_view.pack_id === pack_id)
						.map((pack_view) => ({ label: pack_view.name, value: pack_view._id })),
				]}
				isSearchable
				value={selected_view}
				onChange={(new_value) => set_selected_view(new_value)}
			/>
			<PackView pack_children={pack_children} view_id={selected_view.value} />
			<Section title="options">
				<div className="flex flex-col space-y-2 items-start">
					<StyledDiv onClick={() => change_pack_handler("title")}>
						change title of this pack
					</StyledDiv>

					<StyledDiv onClick={() => change_pack_handler("description")}>
						change description of this pack
					</StyledDiv>

					<StyledDiv onClick={leave_this_pack}>leave this pack </StyledDiv>
					<StyledDiv onClick={delete_this_pack}>delete this pack</StyledDiv>
				</div>
			</Section>
			<CollaboratorsManagementBox context="packs" id={pack_id} />
			<h1 className="mt-2">pack data :</h1>
			<ObjectBox
				object={global_data.all.packs.find((pack) => pack._id === pack_id)}
				link={`/dashboard/packs/${pack_id}`}
			/>
			<MessagesBox />
		</div>
	);
};
