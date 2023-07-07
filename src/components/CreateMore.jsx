import React, { useContext, useEffect, useState } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const CreateMore = ({ onchange }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var [isActive, setIsActive] = useState(false)
    useEffect(() => onchange(isActive), [isActive])
    return (
        <div onClick={() => setIsActive((prev) => !prev)}>
            <i className={isActive ? "bi-toggle-on" : "bi-toggle-off"} />
            <span>{strings[203]}</span>
        </div>
    )
}
