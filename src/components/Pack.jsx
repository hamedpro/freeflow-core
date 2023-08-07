import React, { Fragment, useContext, useState } from "react"

import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { ThingIntroduction } from "./ThingIntroduction"
import { Card } from "primereact/card"
import { SelectButton } from "primereact/selectbutton"
import { Thing } from "./Thing"
import { custom_find_unique } from "../../api_dist/common_helpers"
export const Pack = ({ thing_id, cache }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var cache_item = cache.find((i) => i.thing_id === thing_id)
    var meta = cache_item.its_meta_cache_item
    if (meta === undefined) return strings[60]

    var [sort_mode, set_sort_mode] = useState("timestamp_asce") // "timestamp_desc"
    var [view_mode, set_view_mode] = useState("grouped") // "separated"
    var children = cache.filter(
        (ci) =>
            ci.its_meta_cache_item?.thing.value.pack_id === cache_item.thing_id
    )
    children.sort((ci1, ci2) => {
        if (sort_mode === "timestamp_asce") {
            return (
                uhc.find_first_transaction(ci1.thing_id).time -
                uhc.find_first_transaction(ci2.thing_id).time
            )
        } else {
            return (
                uhc.find_first_transaction(ci2.thing_id).time -
                uhc.find_first_transaction(ci1.thing_id).time
            )
        }
    })
    return (
        <>
            <ThingIntroduction cache_item={cache_item} />

            <Card>
                <div
                    className={`w-full rounded-t flex justify-between bg-white items-center h-6`}
                >
                    <h1 className="text-xl">Pack children</h1>
                    <div className="flex justify-end space-x-2">
                        <SelectButton
                            value={view_mode}
                            options={[
                                {
                                    icon: "bi-folder2",
                                    value: "grouped",
                                },
                                {
                                    icon: "bi-folder2-open",
                                    value: "separated",
                                },
                            ]}
                            itemTemplate={(option) => (
                                <i className={option.icon} />
                            )}
                            onChange={(e) => set_view_mode(e.value)}
                        />
                        <SelectButton
                            value={sort_mode}
                            options={[
                                {
                                    icon: "bi-sort-up",
                                    value: "timestamp_asce",
                                },
                                {
                                    icon: "bi-sort-down",
                                    value: "timestamp_desc",
                                },
                            ]}
                            itemTemplate={(option) => (
                                <i className={option.icon} />
                            )}
                            onChange={(e) => set_sort_mode(e.value)}
                        />
                    </div>
                </div>
            </Card>
            {view_mode === "grouped" &&
                children.map((child) => (
                    <Thing
                        key={child.thing_id}
                        thing_id={child.thing_id}
                    />
                ))}
            {view_mode === "separated" &&
                custom_find_unique(
                    children.map((child) => child.thing.type),
                    (type1, type2) => type1 === type2
                ).map((type) => (
                    <Fragment key={type}>
                        <div className="w-full h-10 flex items-center justify-center">
                            {type}
                        </div>
                        {children
                            .filter((child) => child.thing.type === type)
                            .map((child) => (
                                <Thing
                                    key={child.thing_id}
                                    thing_id={child.thing_id}
                                />
                            ))}
                    </Fragment>
                ))}
        </>
    )
}
