import React from "react";
import { upload_file, upload_new_resource } from "../../api/client";

export const Root = () => {
	return (
		<>
			<input id="image_input" type="file" multiple/>
			<button
				onClick={async () => {
					var response = await upload_new_resource({
						input_element_id: "image_input",
						data: {
							workspace_id: "workspace_id€€",
							workflow_id: "workflow_id##",
						},
					});
					console.log(response);
				}}
				className="block"
			>sumit photo</button>
		</>
	);
};
