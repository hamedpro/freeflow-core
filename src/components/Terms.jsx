import React, { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const Terms = () => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    return <div>{strings[44]}</div>
}
