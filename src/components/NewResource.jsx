import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
import { CreateMore } from "./CreateMore";
export const NewResource = () => {
	var [create_more, set_create_more] = useState();

	var nav = useNavigate();
	var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var [privileges, set_privileges] = useState()
    var [search_params, set_search_params] = useSearchParams()
    var [selected_parent_pack, set_selected_parent_pack] = useState(() => {
        var pack_id = Number(search_params.get("pack_id"))
        if (pack_id) {
            let tmp = cache.find((i) => i.thing_id === pack_id)
            return {
                value: tmp.thing_id,
                label: tmp.thing.value.title,
            }
        } else {
            return { value: null, label: strings[192] }
        }
    })
    function select_parent_pack(value) {
        set_selected_parent_pack(value)
        set_search_params((prev) => {
            var t = {}
            for (var key of prev.keys()) {
                t[key] = prev.get(key)
            }
            return { ...t, pack_id: value.value }
        })
    }
    async function upload_files_handler() {
        var [file] = document.getElementById("file_input").files
        if (!file) {
            alert(strings[204])
            return
        }
        var description = document.getElementById("description_input").value
        var title = document.getElementById("title_input").value
        try {
            var f = new FormData()
            f.append("file", file)
            var file_id = (
                await uhc.configured_axios({
                    data: f,
                    url: "/files",
                    method: "post",
                })
            ).data

            var new_resource_id = await uhc.request_new_transaction({
                new_thing_creator: () => ({
                    type: "unit/resource",
                    value: {
                        description,
                        title,
                        file_id,
                    },
                }),
                thing_id: undefined,
            })
            var new_meta_id = await uhc.request_new_transaction({
                new_thing_creator: () => ({
                    type: "meta",
                    value: {
                        thing_privileges: privileges,
                        modify_thing_privileges: uhc.user_id,
                        locks: [],
                        thing_id: new_resource_id,
                        pack_id: selected_parent_pack.value,
                    },
                }),
                thing_id: undefined,
            })

            alert("all done!")
            if (!create_more) {
                nav(`/dashboard/${new_resource_id}`)
            }
        } catch (error) {
            console.log(error)
            alert(strings[8])
        }
    }

    return (
        <div className="p-2">
            <div>{strings[205]}</div>

            <p>{strings[206]}</p>
            <input className="px-1" type="file" id="file_input" />
            <h1>{strings[207]}</h1>
            <input className="px-1 rounded" id="title_input" />
            <h1>{strings[208]}</h1>
            <textarea
                className="px-1 rounded"
                id="description_input"
                rows={5}
            ></textarea>
            <PrivilegesEditor onChange={set_privileges} />
            <h1>{strings[196]}</h1>
            <Select
                onChange={select_parent_pack}
                value={selected_parent_pack}
                options={[
                    { value: null, label: strings[192] },
                    ...cache
                        .filter((i) => i.thing.type === "unit/pack")
                        .map((i) => {
                            return {
                                value: i.thing_id,
                                label: i.thing.value.title,
                            }
                        }),
                ]}
                isSearchable
            />
            <StyledDiv onClick={upload_files_handler} className="w-fit mt-2">
                {strings[209]}
            </StyledDiv>
            <CreateMore
                onchange={(new_state) => {
                    set_create_more(new_state)
                }}
            />
        </div>
    )
};
