import React, { useContext } from "react"
import { FinderQueryBuilder } from "./FinderQueryBuilder"
import { Button } from "primereact/button"
import { useSearchParams } from "react-router-dom"
import { finder } from "../../api_dist/api/utils"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { CustomPaginatorPanel } from "./DashboardParts"
import { Thing } from "./Thing"
import { CustomNavBar } from "./CustomNavBar"

export const Finder = () => {
    var [search_params, set_search_params] = useSearchParams()
    var { transactions, cache } = useContext(UnifiedHandlerClientContext)
    var find_results = finder(
        transactions,
        cache,
        search_params.get("finder_query") || "[]",
        uhc.user_id
    )
    return (
        <div>
            <CustomNavBar
                main_text={"Find Everything You Want. Instantly."}
                back_text={"Feed"}
                back_link={"/feed"}
            />
            <FinderQueryBuilder />
            <div className="mt-4">
                <h1>You can also select one of these presets:</h1>
                <div className="p-buttonset mt-2 w-full mb-6">
                    <Button
                        onClick={() => {
                            set_search_params((prev) => {
                                prev.set("finder_query", JSON.stringify([]))
                                return prev
                            })
                        }}
                    >
                        Everything
                    </Button>
                    <Button
                        onClick={() => {
                            set_search_params((prev) => {
                                prev.set(
                                    "finder_query",
                                    JSON.stringify(["saved"])
                                )
                                return prev
                            })
                        }}
                    >
                        Saved Items
                    </Button>
                    <Button
                        onClick={() => {
                            set_search_params((prev) => {
                                prev.set(
                                    "finder_query",
                                    JSON.stringify(["write-access"])
                                )
                                return prev
                            })
                        }}
                    >
                        Write Access
                    </Button>
                </div>
                <hr className="bg-gray-900 my-4" />
                <CustomPaginatorPanel
                    title="Results"
                    items={find_results.map((ci) => (
                        <Thing
                            key={ci.thing_id}
                            thing_id={ci.thing_id}
                            inline
                        />
                    ))}
                    items_per_page={20}
                />
            </div>
        </div>
    )
}
