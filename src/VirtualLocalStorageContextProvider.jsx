import React, { useEffect, useState } from "react"
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext"
export const VirtualLocalStorageContextProvider = ({ children }) => {
    //setting default values if its the first run
    if (window.localStorage.getItem("app_data") === null) {
        window.localStorage.setItem(
            "app_data",
            JSON.stringify({
                profiles_seed: [
                    { user_id: 0, jwt: undefined, is_active: true },
                ],
                lang: "english",
            })
        )
    }

    //loading data from localStorage to state
    var [virtual_local_storage, set_virtual_local_storage] = useState(
        JSON.parse(window.localStorage.getItem("app_data"))
    )
    useEffect(() => {
        window.localStorage.setItem(
            "app_data",
            JSON.stringify(virtual_local_storage)
        )
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
