import React, { useEffect, useRef, useState } from "react";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
export const UnifiedHandlerClientContextProvider = ({ children }) => {
	var [UnifiedHandlerClientContextState, setUnifiedHandlerClientContextState] = useState({
		transactions: [],
		cache: [],
		time_travel_snapshot: undefined,
	});
	if (window.uhc === undefined) {
		window.uhc = new UnifiedHandlerClient(WEBSOCKET_API_ENDPOINT, RESTFUL_API_ENDPOINT);
	}
	useEffect(() => {
		window.uhc.onChanges.cache =
			window.uhc.onChanges.transactions =
			window.uhc.onChanges.time_travel_snapshot =
				() => {
					setUnifiedHandlerClientContextState((prev) => ({
						transactions: window.uhc.transactions,
						cache: window.uhc.cache,
						time_travel_snapshot: window.uhc.time_travel_snapshot,
					}));
				};
		if (window.localStorage.getItem("jwt") !== null) {
			window.uhc.auth();
		}
	}, []);

	return (
		<UnifiedHandlerClientContext.Provider value={UnifiedHandlerClientContextState}>
			{children}
		</UnifiedHandlerClientContext.Provider>
	);
};
