import React, { useEffect, useState } from "react";
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext";
export const VirtualLocalStorageContextProvider = ({ children }) => {
	var INITIAL_PROFILES_SEED = [{ user_id: 0, jwt: undefined, is_active: true }];
	if (window.localStorage.getItem("profiles_seed") === null) {
		window.localStorage.setItem("profiles_seed", JSON.stringify(INITIAL_PROFILES_SEED));
	}
	var [virtual_local_storage, set_virtual_local_storage] = useState({
		profiles_seed: JSON.parse(window.localStorage.getItem("profiles_seed")),
	});
	
	window.localStorage.setItem(
		"profiles_seed",
		JSON.stringify(virtual_local_storage.profiles_seed)
	);
	window.uhc.profiles_seed = virtual_local_storage.profiles_seed;
	window.uhc.sync_profiles();
	return (
		<VirtualLocalStorageContext.Provider
			value={{
				profiles_seed: virtual_local_storage.profiles_seed,
				set_virtual_local_storage,
			}}
		>
			{children}
		</VirtualLocalStorageContext.Provider>
	);
};
