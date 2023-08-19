import React, { useContext, useEffect, useState } from "react"
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext"
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient"
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext"
import translation_packs from "./translation_packs"
export const UnifiedHandlerClientContextProvider = ({ children }) => {
    var {
        profiles_seed,
        lang,
        set_virtual_local_storage,
        all_transactions,
        calendar_type,
    } = useContext(VirtualLocalStorageContext)

    //it works just like strings.
    //you can pass 2 functions and use language matching one and pass something to it
    //or you can pass 2 strings and use matching one
    window.custom_translate = (english, persian) =>
        lang === "persian" ? persian : english
    var [
        UnifiedHandlerClientContextState,
        setUnifiedHandlerClientContextState,
    ] = useState({
        transactions: [],
        cache: [],
        time_travel_snapshot: undefined,
        strings: translation_packs[lang],
    })
    if (window.uhc === undefined) {
        window.uhc = new UnifiedHandlerClient(
            WEBSOCKET_API_ENDPOINT,
            RESTFUL_API_ENDPOINT,
            undefined,
            translation_packs[lang]
        )
        window.uhc.onChange = () => {
            setUnifiedHandlerClientContextState((prev) => ({
                ...prev,
                transactions: window.uhc.transactions,
                cache: window.uhc.cache,
                time_travel_snapshot: window.uhc.time_travel_snapshot,
            }))
        }
    }
    useEffect(() => {
        window.uhc.profiles_seed = profiles_seed
        window.uhc.all_transactions = all_transactions
        window.uhc.sync_cache().then(
            () => window.uhc.sync_profiles_seed(),
            (error) => {
                console.log(error)
                throw "sync cache failed"
            }
        )
    }, [profiles_seed])
    useEffect(() => {
        set_virtual_local_storage((prev) => ({
            ...prev,
            all_transactions: window.uhc.all_transactions,
        }))
    }, [UnifiedHandlerClientContextState.transactions])
    useEffect(() => {
        window.uhc.sync_cache()
    }, [all_transactions])
    useEffect(() => {
        window.uhc.strings = translation_packs[lang]
        setUnifiedHandlerClientContextState((prev) => ({
            ...prev,
            strings: translation_packs[lang],
        }))
    }, [lang])

    useEffect(() => {
        if (window.uhc.user_id === 0) {
            return
        }
        var user_selected_lang = UnifiedHandlerClientContextState.cache.find(
            (cache_item) => cache_item.thing_id === window.uhc.user_id
        )?.thing.value.language
        if (
            user_selected_lang !== undefined &&
            user_selected_lang !== null &&
            user_selected_lang !== lang &&
            user_selected_lang !== "ref_not_available"
        ) {
            set_virtual_local_storage((prev) => ({
                ...prev,
                lang: user_selected_lang,
            }))
        }

        var selected_calendar_type =
            UnifiedHandlerClientContextState.cache.find(
                (cache_item) => cache_item.thing_id === window.uhc.user_id
            )?.thing.value.calendar_type
        if (
            selected_calendar_type !== undefined &&
            selected_calendar_type !== null &&
            selected_calendar_type !== calendar_type &&
            selected_calendar_type !== "ref_not_available"
        ) {
            set_virtual_local_storage((prev) => ({
                ...prev,
                calendar_type: selected_calendar_type,
            }))
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
