import { Button } from "primereact/button"
import { Chips } from "primereact/chips"
import { MultiSelect } from "primereact/multiselect"
import React, { useContext } from "react"
import { useSearchParams } from "react-router-dom"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { custom_find_unique } from "../../common_helpers"
import { Dropdown } from "primereact/dropdown"

export const FinderQueryBuilder = () => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var [search_params, set_search_params] = useSearchParams()
    var parsed_finder_query = JSON.parse(
        search_params.get("finder_query") || "[]"
    )
    var all_tags = custom_find_unique([
        ...cache.map((ci) => ci.thing.value.tags || []),
    ])

    return (
        <div className="w-full">
            <label>Your Finder Query:</label>
            <div className="p-inputgroup mt-2">
                <Chips
                    pt={{ container: { style: { width: "100%" } } }}
                    className="w-full"
                    value={JSON.parse(
                        search_params.get("finder_query") || "[]"
                    )}
                    onChange={(e) =>
                        set_search_params((prev) => {
                            prev.set("finder_query", JSON.stringify(e.value))
                            return prev
                        })
                    }
                    separator=","
                    placeholder="enter comma seperated values"
                />
                <MultiSelect
                    optionLabel="tag"
                    options={[{ tag: "work" }, { tag: "uni" }]}
                    onChange={(e) =>
                        set_search_params((prev) => {
                            prev.set(
                                "finder_query",
                                JSON.stringify(
                                    JSON.parse(
                                        search_params.get("finder_query") ||
                                            "[]"
                                    )
                                        .filter(
                                            (part) =>
                                                part.startsWith("tag:") ===
                                                false
                                        )
                                        .concat(
                                            e.value.map(
                                                ({ tag }) => `tag:${tag}`
                                            )
                                        )
                                )
                            )
                            return prev
                        })
                    }
                    value={JSON.parse(search_params.get("finder_query") || "[]")
                        .filter((string) => string.startsWith("tag:"))
                        .map((part) => part.split(":")[1])
                        .map((tag) => ({ tag }))}
                />
                <Dropdown
                    optionLabel="value"
                    value={
                        parsed_finder_query
                            .filter((part) => part.startsWith("sort:"))
                            .at(-1)
                            ?.split(":")[1]
                    }
                    options={[
                        { value: "least-recently-created" },
                        { value: "recently-created" },
                        { value: "least-recently-updated" },
                        { value: "recently-updated" },
                    ]}
                    onChange={(e) => {
                        set_search_params((prev) => {
                            var new_parsed_finder_query = parsed_finder_query
                                .filter(
                                    (part) => part.startsWith("sort:") === false
                                )
                                .concat([`sort:${e.value}`])
                            prev.set(
                                "finder_query",
                                JSON.stringify(new_parsed_finder_query)
                            )
                            return prev
                        })
                    }}
                />
            </div>
        </div>
    )
}
