import React from "react";

import ObjectBox from "./ObjectBox";
import { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

const UserProfile = ({ cache_item }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    return (
        <div className="p-2">
            <h1>{strings[148]}</h1>
            <br />
            <ObjectBox object={cache_item} />
        </div>
    )
}

export default UserProfile;
