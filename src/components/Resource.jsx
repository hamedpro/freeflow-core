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
import { SummarizeHistory } from "./SummarizeHistory"
export const Resource = ({ cache_item, inline }) => {
    var nav = useNavigate()
    var { strings, cache, transactions } = useContext(
        UnifiedHandlerClientContext
    )

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
    var file_id = cache_item.thing.value.file_id
    var file_meta = cache.find(
        (cache_item) =>
            cache_item.thing.value.file_id === file_id &&
            cache_item.thing.type === "meta"
    )
    if (inline === true) {
        return (
            <InlineThingTemplate onClick={() => nav(`/${cache_item.thing_id}`)}>
                <div className="grid grid-cols-4">
                    <div className="h-full w-full col-span-1 grid place-items-center p-4">
                        {file_meta === undefined ? (
                            <>
                                <i className="bi-exclamation-triangle-fill text-5xl" />
                                <p className="text-center">
                                    no meta could be found for this resource.
                                </p>
                            </>
                        ) : (
                            <>
                                <CustomFileViewer
                                    file_id={file_id}
                                    inline
                                />
                                <p className="text-center text-xl">
                                    {cache_item.thing.value.title}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="col-span-2 border-l border-gray-200">
                        <div className="px-4">
                            <div className="text-xl mb-1">
                                <span>Description :</span>
                            </div>
                            {cache_item.thing.value.description ||
                                "no description"}
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Sunt temporibus unde dignissimos quos quia
                            quam aut nulla illum, laboriosam eius cum vero,
                            cumque aliquid amet consectetur optio cupiditate
                            facilis ut.
                        </div>
                    </div>
                    <div className="col-span-1">
                        <ReputationInlinePreview cache_item={cache_item} />
                        <hr className="my-2 text-gray-200" />
                        <CustomAvatarGroup thing_id={cache_item.thing_id} />
                        <hr className="my-2 text-gray-200" />
                        <SummarizeHistory cache_item={cache_item} />
                    </div>
                </div>
            </InlineThingTemplate>
        )
    }
    return (
        <>
            <ThingIntroduction {...{ cache_item }} />
            <div className="">
                <Panel header={"Linked File"}>
                    <CustomFileViewer file_id={file_id} />
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
