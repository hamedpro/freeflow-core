import React, { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Panel } from "primereact/panel"

export const Units = () => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    return (
        <Panel header={"Units"}>
            {cache
                .filter((ci) => ci.thing.type.startsWith("unit/"))
                .map((ci) => (
                    <h1 key={ci.thing_id}>unit with id = {ci.thing_id}</h1>
                ))}
        </Panel>
    )
}
