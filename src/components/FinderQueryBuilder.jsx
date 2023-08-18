import { Chips } from "primereact/chips"
import React from "react"
import { useSearchParams } from "react-router-dom"

export const FinderQueryBuilder = () => {
    var [search_params, set_search_params] = useSearchParams()
    return (
        <div className="w-full">
            <Chips
                className="w-full"
                value={JSON.parse(search_params.get("finder_query") || "[]")}
                onChange={(e) =>
                    set_search_params((prev) => {
                        prev.set("finder_query", JSON.stringify(e.value))
                        return prev
                    })
                }
                separator=","
                placeholder="enter comma seperated values"
            />
        </div>
    )
}
