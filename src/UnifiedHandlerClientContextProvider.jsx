import React, { useContext, useEffect, useState } from "react"
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext"
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient"
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext"
import translation_packs from "./translation_packs"
export const UnifiedHandlerClientContextProvider = ({ children }) => {
    var { profiles_seed, lang, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )

    var [
        UnifiedHandlerClientContextState,
        setUnifiedHandlerClientContextState,
    ] = useState({
        transactions: [],
        cache: [],
        time_travel_snapshot: undefined,
    })
    if (window.uhc === undefined) {
        window.uhc = new UnifiedHandlerClient(
            WEBSOCKET_API_ENDPOINT,
            RESTFUL_API_ENDPOINT
        )
        window.uhc.onChanges.cache =
            window.uhc.onChanges.transactions =
            window.uhc.onChanges.time_travel_snapshot =
                () => {
                    setUnifiedHandlerClientContextState((prev) => ({
                        transactions: window.uhc.transactions,
                        cache: window.uhc.cache,
                        time_travel_snapshot: window.uhc.time_travel_snapshot,
                    }))
                }
    }
    useEffect(() => {
        window.uhc.profiles_seed = profiles_seed
        window.uhc.sync_profiles()
    }, [profiles_seed])
    useEffect(() => {
        window.strings = translation_packs[lang]
    }, [lang])

    useEffect(() => {
        if (window.uhc.user_id === 0) {
            return
        }
        var user_selected_lang = UnifiedHandlerClientContextState.cache.find(
            (cache_item) => cache_item.thing_id === window.uhc.user_id
        )?.thing.value.language
        if (user_selected_lang !== undefined && user_selected_lang !== lang) {
            set_virtual_local_storage((prev) => ({
                ...prev,
                lang: user_selected_lang,
            }))
            console.log(strings)
        }
    }, [UnifiedHandlerClientContextState.cache, profiles_seed])

    return (
        <UnifiedHandlerClientContext.Provider
            value={UnifiedHandlerClientContextState}
        >
            {children}
        </UnifiedHandlerClientContext.Provider>
    )
}
