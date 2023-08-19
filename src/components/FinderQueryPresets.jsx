import { SelectButton } from "primereact/selectbutton"
import React from "react"
import { simple_arrays_are_identical, sorted } from "../../api_dist/api/utils"
import { useSearchParams } from "react-router-dom"

export const FinderQueryPresets = () => {
    var [search_params, set_search_params] = useSearchParams()
    var parsed_finder_query = JSON.parse(
        search_params.get("finder_query") || "[]"
    )
    var options = ["Everything", "Saved Items", "Write Access"]
    var selected_option
    if (
        simple_arrays_are_identical(sorted(parsed_finder_query), sorted([""]))
    ) {
        selected_option = "Everything"
    } else if (
        simple_arrays_are_identical(
            sorted(parsed_finder_query),
            sorted(["saved"])
        )
    ) {
        selected_option = "Saved Items"
    } else if (
        simple_arrays_are_identical(
            sorted(parsed_finder_query),
            sorted(["write-access"])
        )
    ) {
        selected_option = "Write Access"
    }
    return (
        <div className="mt-4">
            <h1>You can also select one of these presets:</h1>
            <div className="p-buttonset mt-2 w-full mb-6">
                <SelectButton
                    options={options}
                    value={selected_option}
                    onChange={({ value }) => {
                        set_search_params((prev) => {
                            if (value === "Everything") {
                                prev.set("finder_query", JSON.stringify([]))
                            } else if (value === "Saved Items") {
                                prev.set(
                                    "finder_query",
                                    JSON.stringify(["saved"])
                                )
                            } else {
                                prev.set(
                                    "finder_query",
                                    JSON.stringify(["write-access"])
                                )
                            }
                            return prev
                        })
                    }}
                />
            </div>
        </div>
    )
}
