import React, { useEffect, useState } from "react"
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext"
export const VirtualLocalStorageContextProvider = ({ children }) => {
    //setting default values if its the first run
    if (window.localStorage.getItem("app_data") === null) {
        window.localStorage.setItem(
            "app_data",
            JSON.stringify({
                profiles_seed: [
                    {
                        user_id: 0,
                        jwt: undefined,
                        is_active: true,
                        max_sync_depth: 3,
                    },
                ],
                lang: "english",
                calendar_type: "english",
                all_transactions: [],
            })
        )
    }

    //loading data from localStorage to state
    var [virtual_local_storage, set_virtual_local_storage] = useState(
        JSON.parse(window.localStorage.getItem("app_data"))
    )
    useEffect(() => {
        try {
            window.localStorage.setItem(
                "app_data",
                JSON.stringify(virtual_local_storage)
            )
        } catch (error) {
            console.log(error)
            alert(
                "warning : when tried to write new value of this to localStorage an error happened : virtual local storage context state."
            )
            alert(
                "it doesnt cause any problem but maybe any new try to sync state to disk fail. contact us to fix it. more info is in console"
            )
        }
    }, [virtual_local_storage])

    return (
        <VirtualLocalStorageContext.Provider
            value={{
                ...virtual_local_storage,
                set_virtual_local_storage,
            }}
        >
            {children}
        </VirtualLocalStorageContext.Provider>
    )
}
