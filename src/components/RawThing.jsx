import React, { useContext } from "react"
import { MessagesBox } from "./MessagesBox"
import ObjectBox from "./ObjectBox"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const RawThing = ({ thing_transactions, cache_item }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    return (
        <>
            <p>
                {strings[149]} {cache_item.thing_id}
            </p>
            <ObjectBox object={cache_item.thing} />
            <MessagesBox thing_id={cache_item.thing_id} />
        </>
    )
}
