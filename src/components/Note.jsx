import React, { useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { custom_axios_download } from "../../api/client"

import { Section } from "./section"
import { StyledDiv } from "./styled_elements"
import { Item, Menu, useContextMenu } from "react-contexify"
import { CustomEditorJs } from "./CustomEditorJs"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { ThingIntroduction } from "./ThingIntroduction"
import { Panel } from "primereact/panel"
import { Button } from "primereact/button"
import { PrivilegesEditor } from "./PrivilegesEditor"
import { ParentPackChangePanel } from "./ParentPackChangePanel"
export const Note = ({ cache_item }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    var editor_js_instance = useRef()
    var { show } = useContextMenu({
        id: "options_context_menu",
    })

    const saveHandler = async () => {
        var data = await editor_js_instance.current.save()
        try {
            await uhc.request_new_transaction({
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: { ...prev.value, data },
                }),
                thing_id: cache_item.thing_id,
            })
        } catch (error) {
            console.log(error)
            alert(strings[94])
        }
        alert(strings[95])
    }

    var note_locks = uhc.find_thing_meta(cache_item.thing_id).thing.value.locks
    var note_data_lock = note_locks.find((i) => i.path[0] === "data")
    async function lock_note_data_for_me() {
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: {
                    ...prev.value,
                    locks: [
                        ...prev.value.locks,
                        { path: ["data"], value: uhc.user_id },
                    ],
                },
            }),
            thing_id: uhc.find_thing_meta(cache_item.thing_id).thing_id,
        })
    }
    async function release_note_data_lock() {
        var new_locks = note_locks.filter((i) => i.path[0] !== "data")

        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: {
                    ...prev.value,
                    locks: new_locks,
                },
            }),
            thing_id: uhc.find_thing_meta(cache_item.thing_id).thing_id,
        })
    }
    return (
        <>
            <ThingIntroduction {...{ cache_item }} />

            <Panel
                headerTemplate={({ className }) => (
                    <div
                        className={`${className} w-full flex justify-between px-4 items-center`}
                    >
                        <h1 className="text-xl">{strings[108]}</h1>
                        {note_data_lock === undefined && (
                            <Button
                                className="text-xs"
                                onClick={lock_note_data_for_me}
                            >
                                <i className="bi-lock pr-1" />
                                lock for me
                            </Button>
                        )}
                        {note_data_lock !== undefined &&
                            note_data_lock.value === uhc.user_id && (
                                <Button
                                    className="text-xs"
                                    onClick={release_note_data_lock}
                                >
                                    <i className="bi-unlock pr-1" />
                                    release lock
                                </Button>
                            )}

                        {note_data_lock !== undefined &&
                            note_data_lock.value !== uhc.user_id &&
                            `is locked : ${note_data_lock.value}`}
                    </div>
                )}
                className=" relative w-full overflow-hidden rounded mb-2"
            >
                <CustomEditorJs
                    onChange={undefined && saveHandler}
                    note_id={cache_item.thing_id}
                    pass_ref={(i) => (editor_js_instance.current = i)}
                />
            </Panel>

            <Button
                className="w-full text-sm flex justify-center"
                onClick={saveHandler}
            >
                <i className="bi-cloud-upload-fill pr-2 items-center" />{" "}
                {strings[109]}
            </Button>
            <PrivilegesEditor
                cache_item={cache_item}
                className="mt-4"
            />
        </>
    )
}
