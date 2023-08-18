import React, { useContext } from "react"
import { FinderQueryBuilder } from "./FinderQueryBuilder"
import { Button } from "primereact/button"
import { useSearchParams } from "react-router-dom"
import { finder } from "../../api_dist/api/utils"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { CustomPaginatorPanel } from "./DashboardParts"
import { Thing } from "./Thing"

export const Finder = () => {
    var [search_params, set_search_params] = useSearchParams()
    var { transactions, cache } = useContext(UnifiedHandlerClientContext)
    var find_results = finder(
        transactions,
        cache,
        search_params.get("finder_query") || "[]"
    )
    return (
        <div>
            <h1>Finder</h1>
            <FinderQueryBuilder />
            <div>
                <Button
                    onClick={() => {
                        set_search_params((prev) => {
                            prev.set("finder_query", JSON.stringify([]))
                            return prev
                        })
                    }}
                >
                    every discoverable thing
                </Button>
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
