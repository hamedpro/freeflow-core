import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { custom_axios_download } from "../../api/client"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Item, Menu, useContextMenu } from "react-contexify"
import { CustomFileViewer } from "./CustomFileViewer"
import { Section } from "./section"
import { ThingIntroduction } from "./ThingIntroduction"
import { Panel } from "primereact/panel"
import { FileUpload } from "primereact/fileupload"
import { PrivilegesEditor } from "./PrivilegesEditor"
export const Resource = ({ cache_item, inline }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var { show } = useContextMenu({
        id: "options_context_menu",
    })

    async function change_source_file(file) {
        if (file === undefined) {
            alert(strings[111])
            return
        }
        var f = new FormData()
        f.append("file", file)
        var { new_file_id, meta_id_of_file } = (
            await uhc.configured_axios({
                data: f,
                url: "/files",
                method: "post",
            })
        ).data
        await uhc.request_new_transaction({
            diff: [
                {
                    op: "update",
                    path: ["value", "file_privileges", "read"],
                    val: `$$ref::${cache_item.its_meta_cache_item.thing_id}:value/thing_privileges/read`,
                },
            ],
            thing_id: meta_id_of_file,
        })
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, file_id: new_file_id },
            }),
            thing_id: cache_item.thing_id,
        })

        alert(strings[64])
    }

    return (
        <>
            <ThingIntroduction {...{ cache_item }} />
            <div className="">
                <Panel header={"Linked File"}>
                    <CustomFileViewer
                        file_id={cache_item.thing.value.file_id}
                    />
                </Panel>

                <Panel
                    header={strings[114]}
                    className="mt-4"
                >
                    <FileUpload
                        uploadHandler={(props) =>
                            change_source_file(props.files[0]).finally(() =>
                                props.options.clear()
                            )
                        }
                        customUpload
                        multiple={false}
                    />
                </Panel>
                <PrivilegesEditor
                    cache_item={cache_item}
                    className="mt-4"
                />
            </div>
        </>
    )
}
