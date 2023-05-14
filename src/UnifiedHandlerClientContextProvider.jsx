import React, { useState } from "react";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
export const UnifiedHandlerClientContextProvider = ({ children }) => {
	var unified_handler_client = new UnifiedHandlerClient(
		"http://localhost:4001",
		"http://localhost:4000"
	);
	var tmp = () => ({
		discoverable_transactions: unified_handler_client.discoverable_transactions,
		current_surface_cache: unified_handler_client.current_surface_cache,
		unified_handler_client,
	});
	var [UnifiedHandlerClientContextState, setUnifiedHandlerClientContextState] = useState(tmp);

	unified_handler_client.time_travel_snapshot_onchange = () => {
		JSON.parse(JSON.stringify(setUnifiedHandlerClientContextState(tmp)));
	};
	unified_handler_client.discoverable_transactions_onchange = () => {
		JSON.parse(JSON.stringify(setUnifiedHandlerClientContextState(tmp)));
	};
	unified_handler_client.auth(
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2ODM5MjQ3NDd9.X8tkfYzeSRAP9shULs8NmHB9V1ICe2o14IT-LYRJjHc"
	);

	return (
		<UnifiedHandlerClientContext.Provider value={UnifiedHandlerClientContextState}>
			{children}
		</UnifiedHandlerClientContext.Provider>
	);
};
