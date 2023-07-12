import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import {
    matchPath,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom"
import { calc_units_tree } from "../../common_helpers"
import { calc_all_paths, find_unit_parents } from "../../api_dist/api/utils"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { PanelMenu } from "primereact/panelmenu"
import "./PrimarySideBar.css"
function AddNewUnitPanelMenu() {
    var [search_params] = useSearchParams()
    var nav = useNavigate()
    var { cache } = useContext(UnifiedHandlerClientContext)
    function onclick_handler(type) {
        var { pathname } = window.location

        var regex1 = /(?:\/)*dashboard\/(?<thing_id>[0-9]+).*$/g
        var regex_result = regex1.exec(pathname)
        var pack_id
        if (regex_result) {
            if (
                cache.find(
                    (i) => i.thing_id === Number(regex_result.groups.thing_id)
                ).thing.type === "unit/pack"
            ) {
                var pack_id = Number(regex_result.groups.thing_id)
            } else {
                var pack_id = find_unit_parents(
                    cache,
                    Number(regex_result.groups.thing_id)
                )[0]
            }

            nav(
                `/dashboard/${type.split("/")[1] + "s"}/new` +
                    (pack_id ? `?pack_id=${pack_id}` : "")
            )
        } else if ((pack_id = search_params.get("pack_id"))) {
            nav(
                `/dashboard/${type.split("/")[1] + "s"}/new` +
                    `?pack_id=${pack_id}`
            )
        } else {
            nav(`/dashboard/${type.split("/")[1] + "s"}/new`)
        }
    }
    var model = [
        {
            icon: <i className="bi-plus-lg font-extrabold pr-2"></i>,
            label: "New Unit",
            items: [
                {
                    label: "New Pack",
                    icon: <i className="bi-box-fill pr-2"></i>,
                    command: () => onclick_handler("unit/pack"),
                },
                {
                    label: "New Task",
                    icon: <i className="bi-clipboard-fill pr-2"></i>,
                    command: () => onclick_handler("unit/task"),
                },
                {
                    label: "New Resource",
                    icon: <i className="bi-cloud-upload-fill pr-2"></i>,
                    command: () => onclick_handler("unit/resource"),
                },
                {
                    label: "New Note",
                    icon: <i className="bi-card-text pr-2"></i>,
                    command: () => onclick_handler("unit/note"),
                },
                {
                    label: "New Event",
                    icon: <i className="bi-calendar4-event pr-2"></i>,
                    command: () => onclick_handler("unit/event"),
                },
                {
                    label: "New Ask",
                    icon: <i className="bi-patch-question-fill pr-2"></i>,
                    command: () => onclick_handler("unit/ask"),
                },
                {
                    label: "New Chat",
                    icon: <i className="bi-chat-dots-fill pr-2" />,
                    command: () => onclick_handler("unit/chat"),
                },
            ],
        },
    ]
    return <PanelMenu className="p-2" model={model} />
}
export const PrimarySideBar = () => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    var [search_params] = useSearchParams()
    var [units_panel_menu_model, set_units_panel_menu_model] = useState([])
    var loc = useLocation()

    var units_tree = useMemo(() => calc_units_tree(cache, undefined), [cache])
    var active_item_id = useMemo(() => {
        var match_path_result = matchPath(
            { path: "/dashboard/:thing_id/*" },
            loc.pathname
        )

        if (
            match_path_result !== null &&
            !isNaN(Number(match_path_result.params.thing_id)) &&
            Number(match_path_result.params.thing_id) !== 0
        ) {
            return Number(match_path_result.params.thing_id)
        } else if (search_params.get("pack_id")) {
            return Number(search_params.get("pack_id"))
        } else {
            return undefined
        }
    }, [loc.pathname, loc.search])
    function make_tree_prime_react_compatible(tree, indent_level = 0) {
        var expanded_items =
            (active_item_id &&
                calc_all_paths(tree)
                    .find(
                        (path) =>
                            path.map((item_id) => Number(item_id)).at(-1) ===
                            active_item_id
                    )
                    ?.map((item_id) => Number(item_id))) ||
            []
        return Object.keys(tree)
            .map((i) => Number(i))
            .map((i) => {
                var cache_item = cache.find((j) => j.thing_id === i)
                if (tree[i] === undefined) {
                    var icon
                    switch (cache_item.thing.type) {
                        case "unit/task":
                            icon = <i className="bi-box-fill pr-2"></i>
                            break

                        case "unit/resource":
                            icon = <i className="bi-cloud-upload-fill pr-2"></i>
                            break

                        case "unit/note":
                            icon = <i className="bi-card-text pr-2"></i>
                            break

                        case "unit/event":
                            icon = <i className="bi-calendar4-event pr-2"></i>
                            break

                        case "unit/ask":
                            icon = (
                                <i className="bi-patch-question-fill pr-2"></i>
                            )
                            break

                        case "unit/chat":
                            icon = <i className="bi-chat-dots-fill pr-2"></i>
                            break
                    }

                    return {
                        icon,
                        command: (e) => {
                            nav(`/dashboard/${cache_item.thing_id}`)
                        },
                        label:
                            cache_item.thing.type === "unit/ask"
                                ? cache_item.thing.value.question
                                : cache_item.thing.value.title,
                        style: {
                            ...(active_item_id === cache_item.thing_id && {
                                backgroundColor: "#f0f0f0",
                            }),
                        },
                    }
                } else {
                    //so its a pack

                    return {
                        label: cache_item.thing.value.title,
                        items: make_tree_prime_react_compatible(
                            tree[i],
                            indent_level + 1
                        ),
                        expanded: expanded_items.includes(cache_item.thing_id),
                        command: (event) => {
                            nav(`/dashboard/${cache_item.thing_id}`)
                        },
                        //separator: true,
                        icon: <i className="bi-box-fill pr-2"></i>,
                        className:
                            active_item_id === cache_item.thing_id
                                ? "selected"
                                : undefined,
                        style: {},
                    }
                }
            })
    }
    function update_panelmenu_model() {
        set_units_panel_menu_model(make_tree_prime_react_compatible(units_tree))
    }
    useEffect(() => {
        update_panelmenu_model()
    }, [cache, loc.pathname, loc.search])

    return (
        <div className="primary_side_bar">
            <AddNewUnitPanelMenu />

            <PanelMenu
                className="px-2 pb-2"
                model={units_panel_menu_model}
                transitionOptions={{ disabled: true }}
            />
        </div>
    )
}
