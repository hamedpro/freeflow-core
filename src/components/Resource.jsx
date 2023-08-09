import React, { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { CustomFileViewer } from "./CustomFileViewer"
import { ThingIntroduction } from "./ThingIntroduction"
import { Panel } from "primereact/panel"
import { FileUpload } from "primereact/fileupload"
import { PrivilegesEditor } from "./PrivilegesEditor"
import { InlineThingTemplate } from "./InlineThingTemplate"
import { ReputationInlinePreview } from "./ReputationInlinePreview"
import { CustomAvatarGroup } from "./CustomAvatarGroup"
import { useNavigate } from "react-router-dom"
export const Resource = ({ cache_item, inline }) => {
    var nav = useNavigate()
    var { strings } = useContext(UnifiedHandlerClientContext)

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
    var first_transaction = uhc.find_first_transaction(cache_item.thing_id)
    if (inline === true) {
        return (
            <InlineThingTemplate onClick={() => nav(`/${cache_item.thing_id}`)}>
                <div>
                    <h1>{cache_item.thing.value.title}</h1>
                    <p>{cache_item.thing.value.description}</p>
                </div>
                <div>
                    <h1>
                        this note was created in {first_transaction.time} by{" "}
                        {first_transaction.user_id}
                    </h1>
                    <ReputationInlinePreview cache_item={cache_item} />
                    <CustomAvatarGroup thing_id={cache_item.thing_id} />
                </div>
            </InlineThingTemplate>
        )
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
