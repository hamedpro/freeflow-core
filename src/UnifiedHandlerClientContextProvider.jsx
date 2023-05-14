import React, { useEffect, useRef, useState } from "react";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
export const UnifiedHandlerClientContextProvider = ({ children }) => {
	//useEffect(() => () => console.log("ejected"));
	//just now im gonna commit changes but there is a problem
	//when around line 29 we call set_state inside the onchange function
	//this component will be unmount and mount and i dont know why
	//it also happens when just having any single set state inside useeffect
	//near line 38

	var [unified_handler_client, set_unified_handler_client] = useState(
		new UnifiedHandlerClient("http://localhost:4001", "http://localhost:4000")
	);
	var tmp = () => ({
		discoverable_transactions: unified_handler_client.discoverable_transactions,
		current_surface_cache: unified_handler_client.current_surface_cache,
	});
	var [UnifiedHandlerClientContextState, setUnifiedHandlerClientContextState] = useState({
		...tmp(),
		unified_handler_client: unified_handler_client,
	});

	unified_handler_client.time_travel_snapshot_onchange = () => {
		setUnifiedHandlerClientContextState({
			...JSON.parse(JSON.stringify(tmp())),
			unified_handler_client: unified_handler_client,
		});
	};

	unified_handler_client.discoverable_transactions_onchange = () => {
		setUnifiedHandlerClientContextState({
			...JSON.parse(JSON.stringify(tmp())),
			unified_handler_client: unified_handler_client,
		});
	};
	useEffect(() => {
		unified_handler_client.auth(
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2ODM5MjQ3NDd9.X8tkfYzeSRAP9shULs8NmHB9V1ICe2o14IT-LYRJjHc"
		);
	}, []);

	return (
		<UnifiedHandlerClientContext.Provider value={UnifiedHandlerClientContextState}>
			{children}
		</UnifiedHandlerClientContext.Provider>
	);
};
