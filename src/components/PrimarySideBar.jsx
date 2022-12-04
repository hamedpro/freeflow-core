import React, { Fragment, useEffect } from "react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { get_user_data_hierarchy } from "../../api/client";
function Option({ text, children, indent_level = 1, type, data }) {
    var {user_id} = useParams()
    var nav = useNavigate()
    var is_selected = true
    function handle_navigation() {
        switch (type) {
            case "workspace":
                nav(`/users/${user_id}/workspaces/${data._id}`)
                break;
            case "workflow":
                nav(`/users/${user_id}/workspaces/${data.workspace_id}/workflows/${data._id}`)
                break;
            case "note":
                nav(`/users/${user_id}/workspaces/${data.workspace_id}/workflows/${data.workflow_id}/notes/${data._id}`)
                break;
            case "task":
                nav(`/users/${user_id}/workspaces/${data.workspace_id}/workflows/${data.workflow_id}/tasks/${data._id}`)
                break;
        }
    }
	return (
		<>
			<div
				className={[
					"border-t border-b border-black flex  items-center w-full",
                    is_selected ? "bg-blue-600 text-white" : "",
                    
                ].join(" ")}
                style={{paddingLeft : (indent_level -1) *20 + "px"}}
				onClick={handle_navigation}
			>
                {text}
			</div>
			{children
				? children.map((child, index) => {
						return (
							<Fragment key={index}>
								<Option {...child} indent_level={indent_level + 1} />
							</Fragment>
						);
				  })
				: null}
		</>
	);
}

export const PrimarySideBar = () => {
    var params = useParams()
    var [data_hierarchy, set_data_hierarchy] = useState();
    var loc = useLocation()
    async function get_data() {
        var user_data_hierarchy = await get_user_data_hierarchy({user_id : params.user_id})
        set_data_hierarchy(user_data_hierarchy)
    }
    useEffect(() => {
        get_data()
    }, [loc])
    if(data_hierarchy == null){
        return "loading user hierarchy..."
    }
	return (
		<>
			{data_hierarchy.map((item, index) => {
				return (
					<Fragment key={index}>
						<Option
							text={item.text}
							is_selected={item.is_selected}
                            children={item.children}
                            data={item.data}
                            type={item.type}
						/>
					</Fragment>
				);
			})}
		</>
	);
};
