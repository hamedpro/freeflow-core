import React, { useContext, useState } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Dropdown } from "primereact/dropdown"
import { Panel } from "primereact/panel"

export const ParentPackChangePanel = ({ cache_item }) => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    async function update_parent_pack(new_parent /* thing_id */) {
        var meta = cache_item.its_meta_cache_item
        if (meta === undefined) {
            alert(
                "failed : tried changing parent pack id of this thing : meta of this thing could not be found. we need to change it."
            )
            return
        }
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, pack_id: new_parent },
            }),
            thing_id: meta.thing_id,
        })
    }
    var dropdown_options = cache
        .filter(
            (ci) =>
                ci.thing.type === "unit/pack" &&
                ci.thing_id !== cache_item.thing_id
        )
        .map((ci) => ({ label: ci.thing.value.title, code: ci.thing_id }))
    var selected_pack = dropdown_options.find(
        (option) =>
            option.code === cache_item.its_meta_cache_item?.thing.value.pack_id
    )

    return (
        <Panel
            header="change parent pack"
            className="mt-4"
        >
            <Dropdown
                className="w-full"
                optionLabel="label"
                value={selected_pack}
                onChange={(e) => update_parent_pack(e.value?.code)}
                options={dropdown_options}
                showClear
            />
        </Panel>
    )
}
