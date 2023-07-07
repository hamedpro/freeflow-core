import React, { useContext } from "react"

import { Item, Menu, useContextMenu } from "react-contexify"
import { custom_axios_download } from "../../api/client"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const Event = ({ cache_item }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var { show } = useContextMenu({
        id: "options_context_menu",
    })
    async function change_event_handler(type) {
        var user_input = window.prompt(strings[62](type))
        if (user_input === null) return
        if (user_input === "") {
            alert(strings[63])
            return
        }

        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, [type]: user_input },
            }),
            thing_id: cache_item.thing_id,
        })

        alert(strings[64])
    }

    async function export_unit_handler() {
        alert(strings[65])
        return
        await custom_axios_download({
            file_name: `events-${event_id}-at-${new Date().getTime()}.tar`,
            url: new URL(
                `/v2/export_unit?unit_id=${event_id}&unit_context=events`,
                window.api_endpoint
            ),
        })
    }
    return (
        <>
            <Menu id="options_context_menu">
                <Item
                    id="change_title"
                    onClick={() => change_event_handler("title")}
                >
                    {strings[66]}
                </Item>
                <Item
                    id="change_title"
                    onClick={() => change_event_handler("description")}
                >
                    {strings[67]}
                </Item>

                <Item id="export_unit" onClick={export_unit_handler}>
                    {strings[69]}
                </Item>
            </Menu>
            <div className="p-4">
                <div className="flex justify-between mb-1 items-center">
                    <h1 className="text-lg">{strings[116]}</h1>
                    <button
                        className="items-center flex"
                        onClick={(event) => show({ event })}
                    >
                        <i className="bi-list text-lg" />{" "}
                    </button>
                </div>
                <h1>{strings[117]}</h1>
                <p>
                    {strings[120]} {cache_item.thing.value.category_id}
                </p>
                <p>
                    {strings[72]} {cache_item.thing.value.title}
                </p>
                <p>
                    {strings[73]} {cache_item.thing.value.description}
                </p>
                <p>
                    {strings[118]} : {cache_item.thing.value.start_date}
                </p>
                <p>
                    {strings[119]} : {cache_item.thing.value.end_date}
                </p>
            </div>
        </>
    )
}
