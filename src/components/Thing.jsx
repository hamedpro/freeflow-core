import React, { useContext } from "react"
import { Pack } from "./Pack"
import { Note } from "./Note"
import { Resource } from "./Resource"
import { Ask } from "./Ask"
import { MessagesBox } from "./MessagesBox"
import UserProfile from "./UserProfile"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

const ThingPart1 = ({ thing_transactions, cache_item, cache }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    switch (cache_item.thing.type) {
        case "unit/pack":
            return (
                <Pack
                    thing_id={cache_item.thing_id}
                    cache={cache}
                />
            )
            break
        case "unit/note":
            return <Note cache_item={cache_item} />
            break
        case "unit/resource":
            return <Resource cache_item={cache_item} />
            break
        case "unit/ask":
            return (
                <Ask
                    cache_item={cache_item}
                    cache={cache}
                />
            )
            break
        case "user":
            return <UserProfile cache_item={cache_item} />
            break
        default:
            return strings[59]
            break
    }
}
export function Thing({ thing_transactions, cache_item, cache }) {
    return (
        <>
            <ThingPart1 {...{ thing_transactions, cache_item, cache }} />
            {<MessagesBox thing_id={cache_item.thing_id} />}
        </>
    )
}
