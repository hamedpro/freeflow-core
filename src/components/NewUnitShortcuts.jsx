import React, { useRef, useState } from "react"
import { FileUpload } from "primereact/fileupload"
import { useNavigate } from "react-router-dom"
import { InputTextarea } from "primereact/inputtextarea"
import { Card } from "primereact/card"
import { ProgressBar } from "primereact/progressbar"
import { Panel } from "primereact/panel"
function NewResource() {
    var nav = useNavigate()
    async function uploadHandler(event) {
        try {
            var file
            for (file of event.files) {
                await uhc.upload_files_handler({
                    file,
                    nav,
                    title: file.name,
                    thing_privileges: { read: [uhc.user_id] },
                    pack_id: undefined,
                    description: "",
                    create_more: true,
                })
            }
        } finally {
            event.options.clear()
        }
    }
    return (
        <>
            <FileUpload
                name="file"
                customUpload
                uploadHandler={uploadHandler}
                multiple
                emptyTemplate={
                    <p className="m-0">
                        Drag and drop files to here to upload.
                    </p>
                }
            />
        </>
    )
}
function NewNote() {
    var [value, set_value] = useState("")
    var nav = useNavigate()
    var progress_started = useRef(false)
    var on_change = (e) => {
        set_value(e.target.value)
        if (progress_started.current === false && value.length >= 20) {
            progress_started.current = true
            uhc.bootstrap_a_writing({
                text: value,
                nav,
            })
        }
    }

    return (
        <Panel header={"start a writing!"}>
            <p className="px-4 py-2 text-sm">
                start typing. once you hit 20 carachters a note is created
                automatically.
            </p>
            <InputTextarea
                onChange={on_change}
                autoResize
                className="w-full"
                rows={8}
            />
            <br />
            <br />

            <ProgressBar
                displayValueTemplate={() => `${20 - value.length} more`}
                value={value.length * 5 > 100 ? 100 : value.length * 5}
            />
        </Panel>
    )
}
export const NewUnitShortcuts = () => {
    return (
        <div className="grid grid-cols-2 grid-rows-1 gap-x-4">
            <div className="grid col-span-1">
                <NewNote />
            </div>
            <div className="grid col-span-1">
                <NewResource />
            </div>
        </div>
    )
}
