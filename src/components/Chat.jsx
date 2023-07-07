import React, { useContext } from "react";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { MessagesBox } from "./MessagesBox";

export const Chat = ({ cache_item }) => {
	var { cache, strings } = useContext(UnifiedHandlerClientContext)
	
	return (
        <div>
            <h1>
                {strings[142]} {cache_item.thing.value.title}
            </h1>
            <MessagesBox thing_id={cache_item.thing_id} />
        </div>
    )
};
