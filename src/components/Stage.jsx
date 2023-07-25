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
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Thing } from "./Thing"
import { TabMenu } from "primereact/tabmenu"
import { MessagesBox } from "./MessagesBox"
export const Stage = () => {
    var urls = ["/:thing_id", "/:thing_id/timeline"]
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
                model={[strings[53], strings[54]].map((i) => ({
                    label: i,
                }))}
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
                            onClick={() => nav(`/${meta_id}`)}
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
                            onClick={() => nav(`/${parent_pack_id}`)}
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
                        <>
                            <Thing thing_id={cache_item.thing_id} />
                            {<MessagesBox thing_id={cache_item.thing_id} />}
                        </>
                    }
                />
                <Route
                    path="timeline"
                    element={
                        <ThingTimeline
                            {...{
                                cache_item,
                                transactions: thing_transactions,
                            }}
                        />
                    }
                />
            </Routes>
        </>
    )
}
