import React, { useEffect, useRef, useState } from "react";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
export const UnifiedHandlerClientContextProvider = ({ children }) => {
	//todo useEffect(() => () => console.log("ejected"));
	//just now im gonna commit changes but there is a problem
	//when around line 29 we call set_state inside the onchange function
	//this component will be unmount and mount and i dont know why
	//it also happens when just having any single set state inside useeffect
	//near line 38

	var uhc = useRef(
		new UnifiedHandlerClient(WEBSOCKET_API_ENDPOINT, RESTFUL_API_ENDPOINT, {
			//todo maybe setstate not be defined yet
			cache: () => {
				setUnifiedHandlerClientContextState((prev) => ({
					transactions: uhc.current.transactions,
					cache: uhc.current.cache,
					time_travel_snapshot: uhc.current.time_travel_snapshot,
				}));
			},
			transactions: () => {
				setUnifiedHandlerClientContextState((prev) => ({
					transactions: uhc.current.transactions,
					cache: uhc.current.cache,
					time_travel_snapshot: uhc.current.time_travel_snapshot,
				}));
			},
			time_travel_snapshot: () => {
				setUnifiedHandlerClientContextState((prev) => ({
					transactions: uhc.current.transactions,
					cache: uhc.current.cache,
					time_travel_snapshot: uhc.current.time_travel_snapshot,
				}));
			},
		})
	); 
	var [UnifiedHandlerClientContextState, setUnifiedHandlerClientContextState] = useState({
		transactions: uhc.current.transactions,
		cache: uhc.current.cache,
		time_travel_snapshot: uhc.current.time_travel_snapshot,
	});
	if (window.uhc === undefined) {
		window.uhc = uhc.current;
	}
	useEffect(() => {
		if (window.localStorage.getItem("jwt") !== null) {
			uhc.current.auth();
		}
	}, []);
	return (
		<UnifiedHandlerClientContext.Provider value={UnifiedHandlerClientContextState}>
			{children}
		</UnifiedHandlerClientContext.Provider>
	);
};
