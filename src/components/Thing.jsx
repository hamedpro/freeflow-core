import React, { useContext } from "react"
import { Pack } from "./Pack"
import { Note } from "./Note"
import { Resource } from "./Resource"
import { Ask } from "./Ask"
import UserProfile from "./UserProfile"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { JsonViewer } from "@textea/json-viewer"
import { Button } from "primereact/button"
import { useNavigate } from "react-router-dom"
import { RawThing } from "./RawThing"
export const Thing = ({ thing_id, inline = false }) => {
    var nav = useNavigate()
    var { strings, cache } = useContext(UnifiedHandlerClientContext)
    var cache_item = cache.find((ci) => ci.thing_id === thing_id)
    if (cache_item === undefined) {
        return `there is no thing cached with id = ${thing_id}`
    }
    switch (cache_item.thing.type) {
        case "unit/pack":
            return (
                <Pack
                    thing_id={cache_item.thing_id}
                    cache={cache}
                    inline={inline}
                />
            )

        case "unit/note":
            return (
                <Note
                    cache_item={cache_item}
                    inline={inline}
                />
            )

        case "unit/resource":
            return (
                <Resource
                    cache_item={cache_item}
                    inline={inline}
                />
            )

        case "unit/ask":
            return (
                <Ask
                    cache_item={cache_item}
                    inline={inline}
                    cache={cache}
                />
            )

        case "user":
            return (
                <UserProfile
                    cache_item={cache_item}
                    inline={inline}
                />
            )

        default:
            return (
                <RawThing
                    cache_item={cache_item}
                    inline={inline}
                />
            )
    }
}
