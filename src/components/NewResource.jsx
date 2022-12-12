import React from "react";
import { useMatch, useParams } from "react-router-dom";
import { upload_new_resources } from "../../api/client";

export const NewResource = () => {
  var {workspace_id,user_id,workflow_id} = useParams()
  function upload_files_handler() {
    upload_new_resources({
      input_element_id: "files_input",
      data: {
        user_id,
        workspace_id,
        workflow_id
      }
    })
  }
	return (
		<>
      <div>NewResource</div>
      <p>upload files to : </p>
      <input type="file" multiple id="files_input" /> 
      <button onClick={upload_files_handler}>submit these</button>

		</>
	);
};
