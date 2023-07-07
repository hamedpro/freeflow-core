import React, { useContext } from "react"
import {
    Route,
    Routes,
    useMatch,
    useNavigate,
    useParams,
} from "react-router-dom"
import { Button } from "primereact/button"
import { ThingTimeline } from "./ThingTimeline"
import { RawThing } from "./RawThing"
import { RawThingTimeline } from "./RawThingTimeline"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Thing } from "./Thing"
import { TabMenu } from "primereact/tabmenu"
export const Stage = () => {
    var urls = [
        "/dashboard/:thing_id",
        "/dashboard/:thing_id/timeline",
        "/dashboard/:thing_id/raw",
        "/dashboard/:thing_id/raw_timeline",
    ]
    var active_url
    for (var url of urls) {
        if (useMatch(url)) {
            active_url = url
        }
    }
    var nav = useNavigate()
    var { cache, transactions, strings } = useContext(
        UnifiedHandlerClientContext
    )
    var { thing_id } = useParams()
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
    var parent_pack_id = meta?.thing.value.pack_id
    var meta_id = meta?.thing_id

    return (
        <>
            <TabMenu
                model={[strings[53], strings[54], strings[55], strings[56]].map(
                    (i) => ({
                        label: i,
                    })
                )}
                activeIndex={urls.indexOf(active_url)}
                onTabChange={(e) =>
                    nav(urls[e.index].replace(":thing_id", thing_id))
                }
            />
            {(parent_pack_id || meta_id) && (
                <div className="p-2 flex space-x-2 py-3">
                    {meta_id && (
                        <Button
                            className="h-8 px-2"
                            icon={
                                <i className="bi-arrow-up-left-circle-fill mr-2" />
                            }
                            onClick={() => nav(`/dashboard/${meta_id}`)}
                        >
                            {strings[57]}
                        </Button>
                    )}
                    {parent_pack_id && (
                        <Button
                            className="h-8"
                            icon={
                                <i className="bi-arrow-up-left-circle-fill mr-2" />
                            }
                            onClick={() => nav(`/dashboard/${parent_pack_id}`)}
                        >
                            {strings[58]}
                        </Button>
                    )}
                </div>
            )}

            <Routes>
                <Route
                    path=""
                    element={
                        <Thing {...{ cache_item, thing_transactions, cache }} />
                    }
                />
                <Route
                    path="timeline"
                    element={
                        <ThingTimeline
                            {...{ cache_item, thing_transactions }}
                        />
                    }
                />
                <Route
                    path="raw"
                    element={
                        <RawThing {...{ cache_item, thing_transactions }} />
                    }
                />
                <Route
                    path="raw_timeline"
                    element={
                        <RawThingTimeline
                            {...{
                                cache_item,
                                thing_transactions,
                                cache,
                                transactions,
                            }}
                        />
                    }
                />
            </Routes>
        </>
    )
}
