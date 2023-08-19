import React, { useContext } from "react"
import { FinderQueryBuilder } from "./FinderQueryBuilder"
import { Button } from "primereact/button"
import { useSearchParams } from "react-router-dom"
import { finder, simple_arrays_are_identical } from "../../api_dist/api/utils"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { CustomPaginatorPanel } from "./DashboardParts"
import { Thing } from "./Thing"
import { CustomNavBar } from "./CustomNavBar"
import { SelectButton } from "primereact/selectbutton"
import { FinderQueryPresets } from "./FinderQueryPresets"

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
            <FinderQueryPresets />
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
    )
}
