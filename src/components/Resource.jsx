import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { custom_axios_download } from "../../api/client";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { StyledDiv } from "./styled_elements";
import { Item, Menu, useContextMenu } from "react-contexify";
import { CustomFileViewer } from "./CustomFileViewer";
import { Section } from "./section";

export const Resource = ({ cache_item }) => {
	var nav = useNavigate();

	var user_id = uhc.user_id;
	var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var { show } = useContextMenu({
        id: "options_context_menu",
    })

    async function export_unit_handler() {
        alert(strings[65])
        return
        await custom_axios_download({
            file_name: `resources-${resource_id}-at-${new Date().getTime()}.tar`,
            url: new URL(
                `/v2/export_unit?unit_id=${resource_id}&unit_context=resources`,
                window.api_endpoint
            ),
        })
    }
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
    async function change_source_file() {
        var [file] = document.getElementById("change_source_file_input").files
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
            <Menu id="options_context_menu">
                <Item
                    id="change_title"
                    onClick={() => change_resource_handler("title")}
                >
                    {strings[66]}
                </Item>
                <Item
                    id="change_description"
                    onClick={() => change_resource_handler("description")}
                >
                    {strings[67]}
                </Item>

                <Item id="export_unit" onClick={export_unit_handler}>
                    {strings[69]}
                </Item>
            </Menu>
            <div className="p-4">
                <div className="flex justify-between mb-1 items-center p-1">
                    <h1 className="text-lg">{strings[84]}</h1>
                    <button
                        className="items-center flex"
                        onClick={(event) => show({ event })}
                    >
                        <i className="bi-list text-lg" />{" "}
                    </button>
                </div>
                <CustomFileViewer file_id={cache_item.thing.value.file_id} />
                <h1>
                    {strings[112]} : {cache_item.thing.value.title}
                </h1>
                <h1>
                    {strings[113]} : {cache_item.thing.value.description}
                </h1>
                <Section title={strings[114]}>
                    <input id="change_source_file_input" type="file" />
                    <button onClick={change_source_file}>{strings[115]}</button>
                </Section>
            </div>
        </>
    )
};
