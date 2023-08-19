import React, { useContext } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { ThingTimeline } from "./ThingTimeline"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Thing } from "./Thing"
import { TabMenu } from "primereact/tabmenu"
import { MessagesBox } from "./MessagesBox"
import { ParentPackChangePanel } from "./ParentPackChangePanel"
export const Stage = () => {
    var { cache, transactions, strings } = useContext(
        UnifiedHandlerClientContext
    )
    var { thing_id } = useParams()
    var [search_params, set_search_params] = useSearchParams()
    var tab = search_params.get("tab") || undefined
    if (!thing_id || isNaN(Number(thing_id))) {
        return strings[51]
    }
    var cache_item = cache.find((i) => i.thing_id === Number(thing_id))
    if (cache_item === undefined) {
        return strings[52](thing_id)
    }

    var thing_transactions = transactions.filter(
        (i) => i.thing_id === Number(thing_id)
    )
    var meta = uhc.find_thing_meta(cache_item.thing_id)

    return (
        <>
            <TabMenu
                model={[strings[53], strings[54]].map((i) => ({
                    label: i,
                }))}
                activeIndex={tab === "timeline" ? 1 : 0}
                onTabChange={(e) =>
                    set_search_params((prev) => {
                        prev.set("tab", e.index === 0 ? "thing" : "timeline")
                        return prev
                    })
                }
            />

            <div className="p-4">
                {tab === "timeline" ? (
                    <ThingTimeline
                        {...{
                            cache_item,
                            transactions: thing_transactions,
                        }}
                    />
                ) : (
                    <>
                        <Thing thing_id={cache_item.thing_id} />{" "}
                        {cache_item.thing.type.startsWith("unit/") && (
                            <ParentPackChangePanel cache_item={cache_item} />
                        )}
                        <MessagesBox thing_id={cache_item.thing_id} />
                    </>
                )}
            </div>
        </>
    )
}
