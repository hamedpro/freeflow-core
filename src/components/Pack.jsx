import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { custom_axios_download, custom_delete } from "../../api/client"
import { calc_units_tree } from "../../common_helpers.js"

import { Section } from "./section"
import { PackView } from "./PackView"
import { Item, Menu, useContextMenu } from "react-contexify"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
export const Pack = ({ thing_id, cache }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var cache_item = cache.find((i) => i.thing_id === thing_id)
    var meta = uhc.find_thing_meta(cache_item.thing_id)
    if (meta === undefined) return strings[60]
    var user_id = uhc.user_id
    var nav = useNavigate()

    var [pack_view_filters, set_pack_view_filters] = useState({
        view_as_groups: false,
        sort: "timestamp_asce",
        // possible values : "timestamp_asce" | "timestamp_desc"
    })

    useEffect(() => {
        var default_pack_view_id = cache_item.thing.value.default_pack_view_id
        if (default_pack_view_id) {
            set_selected_view({
                value: default_pack_view_id,
                label: cache.find((i) => i.thing_id === default_pack_view_id)
                    .thing.value.title,
            })
        }
    }, [])
    var { show } = useContextMenu({
        id: "options_context_menu",
    })

    async function change_pack_handler(type) {
        var tmp = meta.thing.value.thing_privileges.write
        if (tmp !== "*" && !tmp.includes(user_id)) {
            alert(strings[61])
            return
        }
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

    async function delete_this_pack() {
        alert(strings[65])
        return
    }
    async function export_unit_handler() {
        alert(strings[65])
        return
        await custom_axios_download({
            file_name: `packs-${pack_id}-at-${new Date().getTime()}.tar`,
            url: new URL(
                `/v2/export_unit?unit_id=${pack_id}&unit_context=packs`,
                window.api_endpoint
            ),
        })
    }
    return (
        <>
            <Menu id="options_context_menu">
                <Item
                    id="change_title"
                    onClick={() => change_pack_handler("title")}
                >
                    {strings[66]}
                </Item>

                <Item
                    id="change_description"
                    onClick={() => change_pack_handler("description")}
                >
                    {strings[67]}
                </Item>

                <Item id="delete_note" onClick={delete_this_pack}>
                    {strings[68]}
                </Item>
                <Item id="export_unit" onClick={export_unit_handler}>
                    {strings[69]}
                </Item>
            </Menu>
            <div className="p-4">
                <div className="flex justify-between mb-1 items-center">
                    <h1>
                        {strings[70]} #{cache_item.thing_id}
                    </h1>
                    <button
                        className="items-center flex"
                        onClick={(event) => show({ event })}
                    >
                        <i className="bi-list text-lg" />{" "}
                    </button>
                </div>
                <Section title={strings[71]}>
                    <p>
                        {strings[72]} {cache_item.thing.value.title}{" "}
                    </p>
                    <p>
                        {strings[73]} {cache_item.thing.value.description}{" "}
                    </p>
                </Section>
                <Section title={strings[74]}>
                    <h1>{strings[75]} </h1>
                    <p
                        onClick={() =>
                            set_pack_view_filters((prev) => ({
                                ...prev,
                                sort: "timestamp_asce",
                            }))
                        }
                    >
                        {pack_view_filters.sort === "timestamp_asce" ? (
                            <i className="bi-toggle-on" />
                        ) : (
                            <i className="bi-toggle-off" />
                        )}{" "}
                        {strings[76]}
                    </p>
                    <p
                        onClick={() =>
                            set_pack_view_filters((prev) => ({
                                ...prev,
                                sort: "timestamp_desc",
                            }))
                        }
                    >
                        {pack_view_filters.sort === "timestamp_desc" ? (
                            <i className="bi-toggle-on" />
                        ) : (
                            <i className="bi-toggle-off" />
                        )}{" "}
                        {strings[77]}
                    </p>
                    <br />

                    <h1>{strings[78]}</h1>
                    <p
                        onClick={() =>
                            set_pack_view_filters((prev) => ({
                                ...prev,
                                view_as_groups: true,
                            }))
                        }
                    >
                        {pack_view_filters.view_as_groups ? (
                            <i className="bi-toggle-on" />
                        ) : (
                            <i className="bi-toggle-off" />
                        )}
                        {strings[79]}{" "}
                    </p>
                    <p
                        onClick={() =>
                            set_pack_view_filters((prev) => ({
                                ...prev,
                                view_as_groups: false,
                            }))
                        }
                    >
                        {pack_view_filters.view_as_groups !== true ? (
                            <i className="bi-toggle-on" />
                        ) : (
                            <i className="bi-toggle-off" />
                        )}
                        {strings[80]}{" "}
                    </p>
                </Section>
                <PackView
                    pack_children={Object.keys(
                        calc_units_tree(cache, cache_item.thing_id)
                    ).map((i) => Number(i))}
                    view_as_groups={pack_view_filters.view_as_groups}
                    sort={pack_view_filters.sort}
                    cache={cache}
                />
                {/* <MessagesBox of={cache_item.thing_id} /> */}
            </div>
        </>
    )
}
