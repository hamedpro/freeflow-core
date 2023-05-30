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
		new UnifiedHandlerClient("http://localhost:4001", "http://localhost:4000", {
			cache: () => {
				setUnifiedHandlerClientContextState((prev) => ({
					transactions: uhc.current.transactions,
					cache: uhc.current.cache,
				}));
			},
			transactions: () => {
				setUnifiedHandlerClientContextState((prev) => ({
					transactions: uhc.current.transactions,
					cache: uhc.current.cache,
				}));
			},
		})
	);
	var [UnifiedHandlerClientContextState, setUnifiedHandlerClientContextState] = useState({
		transactions: uhc.current.transactions,
		cache: uhc.current.cache,
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
