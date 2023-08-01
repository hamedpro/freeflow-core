import React, { useContext, useEffect, useState } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Badge } from "primereact/badge"
//this is a row on top of every page which warns
//the user if there is a restriction of time travel snapshot
//it says what you see may not be latest data
//and enables user to clear restriction just by a single click
export const TimeTravelWarning = () => {
    var [force_hidden, set_force_hidden] = useState(false)
    var { time_travel_snapshot } = useContext(UnifiedHandlerClientContext)
    useEffect(() => {
        set_force_hidden(false)
    }, [time_travel_snapshot])
    if (time_travel_snapshot !== undefined && force_hidden === false) {
        return (
            <div className="bg-blue-900 w-full relative text-white flex items-center justify-around p-4 space-x-4">
                <span className="flex flex-nowrap">
                    <i className="bi bi-fire pr-2"></i>warning
                </span>
                <span className="">
                    you are in a time travel! any transaction{" "}
                    {time_travel_snapshot.type === "transaction_id"
                        ? `with id > ${time_travel_snapshot.value}`
                        : `submitted after ${new Date(
                              time_travel_snapshot.value
                          ).toLocaleString()}`}{" "}
                    is ignored.
                    <Badge
                        onClick={() => {
                            window.uhc.time_travel(undefined)
                        }}
                        className="ml-3 duration-300 cursor-pointer"
                        style={{ color: "" }}
                        value={"disable it"}
                        severity={"warning"}
                    ></Badge>
                </span>

                <span
                    onClick={() => set_force_hidden(true)}
                    className="cursor-pointer"
                >
                    x
                </span>
            </div>
        )
    }
}
