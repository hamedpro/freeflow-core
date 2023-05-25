import React, { useEffect, useState } from "react";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
export const UnifiedHandlerClientContextProvider = ({ children }) => {
	//todo useEffect(() => () => console.log("ejected"));
	//just now im gonna commit changes but there is a problem
	//when around line 29 we call set_state inside the onchange function
	//this component will be unmount and mount and i dont know why
	//it also happens when just having any single set state inside useeffect
	//near line 38

	var [unified_handler_client, set_unified_handler_client] = useState(
		new UnifiedHandlerClient("http://localhost:4001", "http://localhost:4000")
	);
	var [UnifiedHandlerClientContextState, setUnifiedHandlerClientContextState] = useState({
		transactions: unified_handler_client.transactions,
		cache: unified_handler_client.cache,
		unified_handler_client,
	});
	useEffect(() => {
		unified_handler_client.onChanges.transactions = unified_handler_client.onChanges.cache =
			() => {
				setUnifiedHandlerClientContextState((prev) => ({
					...prev,
					transactions: unified_handler_client.transactions,
					cache: unified_handler_client.cache,
				}));
			};
		if (window.localStorage.getItem("jwt") !== null) {
			unified_handler_client.auth();
		}
		window.uhc = unified_handler_client;
	}, []);
	return (
		<UnifiedHandlerClientContext.Provider value={UnifiedHandlerClientContextState}>
			{children}
		</UnifiedHandlerClientContext.Provider>
	);
};
