import React, { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Item, Menu, useContextMenu } from "react-contexify"
import { Card } from "@mui/material"
import { Button } from "primereact/button"
import { useNavigate } from "react-router-dom"
export const ThingIntroduction = ({ cache_item }) => {
    var nav = useNavigate()
    var { show } = useContextMenu({
        id: "options_context_menu",
    })
    var { strings } = useContext(UnifiedHandlerClientContext)
    async function change_resource_handler(type) {
        var user_input = window.prompt(strings[62](type))
        if (!user_input) {
            alert(strings[110])
            return
        }

        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, [type]: user_input },
            }),
            thing_id: cache_item.thing_id,
        })
        alert(strings[64])
    }
    var meta = uhc.find_thing_meta(cache_item.thing_id)
    var parent_pack_id = meta?.thing.value.pack_id
    var meta_id = meta?.thing_id
    var type = cache_item.thing.type
    if (type.startsWith("unit/") !== true) {
        return "this component yet only supports units"
    }
    return (
        <Card className="mb-4 p-2">
            <Menu id="options_context_menu">
                <Item
                    onClick={() =>
                        change_resource_handler(
                            type === "unit/ask" ? "question" : "title"
                        )
                    }
                >
                    {type === "unit/ask" ? "change question" : "change title"}
                </Item>
                <Item
                    onClick={() =>
                        change_resource_handler(
                            type === "unit/ask"
                                ? "question_body"
                                : "description"
                        )
                    }
                >
                    {type === "unit/ask"
                        ? "change question body "
                        : "change description"}
                </Item>
            </Menu>
            <div className="flex justify-between  items-center p-1 space-x-2">
                <div className="w-full ">
                    {cache_item.thing.type === "unit/pack" && (
                        <i className="bi bi-box" />
                    )}
                    {cache_item.thing.type === "unit/note" && (
                        <i className="bi bi-journals" />
                    )}
                    {cache_item.thing.type === "unit/resource" && (
                        <i className="bi bi-cloud-download" />
                    )}
                    {cache_item.thing.type === "unit/ask" && (
                        <i className="bi bi-question-octagon" />
                    )}
                    <span className="pl-2 text-lg">
                        {cache_item.thing.value.title ||
                            cache_item.thing.value.question}
                    </span>
                </div>

                <button
                    className="items-center flex"
                    onClick={(event) => show({ event })}
                >
                    <i className="bi-list text-lg" />{" "}
                </button>
            </div>
            <div className="w-full">
                <span className="text-gray-500">#{cache_item.thing_id}</span>
                <p>
                    {cache_item.thing.value.description ||
                        cache_item.thing.value.question_body}
                </p>
            </div>
            <div className="flex">
                {(parent_pack_id || meta_id) && (
                    <div className="p-2 flex space-x-2 py-3">
                        {meta_id && (
                            <Button
                                className="h-8 px-2"
                                icon={
                                    <i className="bi-arrow-up-left-circle-fill mr-2" />
                                }
                                onClick={() => nav(`/${meta_id}`)}
                            >
                                {strings[57]}
                            </Button>
                        )}
                        {parent_pack_id && (
                            <Button
                                className="h-8"
                                icon={
                                    <i className="bi-arrow-up-left-circle-fill mr-2" />
                                }
                                onClick={() => nav(`/${parent_pack_id}`)}
                            >
                                {strings[58]}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
