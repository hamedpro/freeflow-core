import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_user_notes , update_note as api_update_note } from "../../api/client";
import ObjectBox from "./ObjectBox";
export const Note = () => {
	var { note_id, workspace_id, workflow_id, user_id } = useParams();
	var [note, set_note] = useState(null);
	async function get_data() {
		var tmp = (await get_user_notes({ creator_user_id: user_id })).find((note) => note._id == note_id);
		set_note(tmp);
		/* 
			now when set_note is done you can see what this "note" state
			looks like (visually) in return func of this component
			(at the time of writing i mean line 25 )
		*/
		if (tmp.blocks) {
			// it will just run if blocks is not undefined and also is not null( and also if its an array it should not be empty)
			/* editor js's instance was initialized in mount useEffect
			so render these blocks into that */
			//use tmp.blocks here instead of note.blocks because set_state is async and may note has not changed yet 
		}
	}
	useEffect(() => {
		var editor_js_div = document.getElementById('editor_js_div')
		//initialize an empty editor js instance here
		get_data();
	}, []);
	async function push_blocks() {
		/* 
			whenever user clicks to save changes or when auto save is on this function
			show be called 
		*/

		/*
			what to do ? get data from editorjs's .save method and use 
			update_note (that's already imported as api_update_note) like this : 

		await update_note({
			note_id,
			update_set: {
				blocks : "blocks object which is inside editor js's .save() method's reuslt "
			}
		})
		*/
	}
	return (
		<div>
            <h1>Note</h1>
            <div>
                <p>workspace_id : {workspace_id }</p>
                <p>workflow_id : {workflow_id }</p>
            </div>
			{note !== null && (
				<>
					<h1>note_data : </h1>
					<ObjectBox object={note} />
				</>
			)}
			<h2>note blocks part</h2>
			<div id="editor_js_div">
				{/* give id of this div to editor js and
				it will take control of it and knows what to do*/}
			</div>
		</div>
	);
};
