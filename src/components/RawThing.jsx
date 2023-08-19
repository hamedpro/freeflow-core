import { JsonViewer } from "@textea/json-viewer"
import { Button } from "primereact/button"
import React from "react"
import { useNavigate } from "react-router-dom"
import { ThingIntroduction } from "./ThingIntroduction"

export const RawThing = ({ cache_item, inline }) => {
    var nav = useNavigate()

    if (inline)
        return (
            <div
                className="bg-white w-full my-4 p-4 shadow rounded grid grid-cols-3 cursor-pointer"
                onClick={() => nav(`/${cache_item.thing_id}`)}
            >
                <div className="col-span-1 py-4 px-6">
                    <h1 className="text-3xl">
                        Not Supported Thing : {cache_item.thing.type}
                    </h1>
                    <hr className="mt-2 mb-4" />
                    <p className="mb-4">
                        Only Units and Users can be shown here. however you can
                        still open it in raw mode.
                    </p>
                    <Button
                        onClick={() => nav(`/${cache_item.thing_id}`)}
                        className=""
                    >
                        Open Raw Data
                    </Button>
                </div>
                <div className="col-span-2 py-4 px-6 border-l border-gray-200">
                    <h1 className="text-xl mb-2">OverView</h1>
                    <JsonViewer value={cache_item.thing.value} />
                    <br />
                </div>
            </div>
        )
    return (
        <div className="bg-white w-full my-4 p-4 shadow rounded grid grid-cols-3 cursor-pointer">
            <JsonViewer value={cache_item.thing} />{" "}
        </div>
    )
}
