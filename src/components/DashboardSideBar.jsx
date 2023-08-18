import React, { useState } from "react"
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar"
import { useLocation, useNavigate } from "react-router-dom"

export const DashboardSideBar = () => {
    var [collapsed, set_collapsed] = useState(true)
    var loc = useLocation()
    var nav = useNavigate()
    return (
        <Sidebar
            className=" h-full"
            collapsed={collapsed}
            rootStyles={{ height: "100%", width: "fit-content" }}
        >
            <Menu rootStyles={{ backgroundColor: "aqua", height: "100%" }}>
                <div
                    className="h-20 flex items-center justify-center  space-x-1 mb-3 cursor-pointer"
                    onClick={() => set_collapsed((prev) => !prev)}
                >
                    {!collapsed && (
                        <i className="bi-chevron-left text-sm pr-2" />
                    )}
                    <i className="bi-hexagon-fill text-3xl" />
                    <i
                        className="bi-chevron-right text-xs"
                        style={{ display: collapsed ? "block" : "none" }}
                    />
                    <span
                        className="pl-3 text-3xl"
                        style={{ display: collapsed ? "none" : "block" }}
                    >
                        FreeFlow
                    </span>
                </div>
                <div className="flex flex-col items-around space-y-2 h-full">
                    <MenuItem
                        icon={<i className="bi-search text-2xl" />}
                        className={
                            (loc.pathname === "/" ||
                                loc.pathname.startsWith("/finder")) &&
                            "bg-blue-300"
                        }
                        onClick={() => nav("/finder")}
                    >
                        Finder
                    </MenuItem>
                    <MenuItem
                        icon={<i className="bi-gear-wide-connected text-2xl" />}
                        className={
                            loc.pathname.startsWith("/preferences") &&
                            "bg-blue-300"
                        }
                        onClick={() => nav("/preferences")}
                    >
                        Preferences
                    </MenuItem>

                    <MenuItem
                        icon={<i className="bi-binoculars-fill text-2xl" />}
                        className={loc.pathname === "/feed" && "bg-blue-300"}
                        onClick={() => nav("/feed")}
                    >
                        Network Discovery
                    </MenuItem>
                    <MenuItem
                        icon={<i className="bi-bell-fill text-2xl" />}
                        className={
                            loc.pathname.startsWith("/whats-happening") &&
                            "bg-blue-300"
                        }
                        onClick={() => nav("/whats-happening")}
                    >
                        Whats Happening
                    </MenuItem>
                    <MenuItem
                        className={
                            loc.pathname.startsWith("/new-unit") &&
                            "bg-blue-300"
                        }
                        icon={<i className="bi-plus-square-fill text-2xl" />}
                        onClick={() => nav("/new-unit")}
                    >
                        New Unit
                    </MenuItem>
                </div>
            </Menu>
        </Sidebar>
    )
}
