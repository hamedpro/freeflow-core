import React, { useContext } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
import { CreateMore } from "./CreateMore";
export const NewPack = () => {
    var [create_more, set_create_more] = useState()
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var [search_params, set_search_params] = useSearchParams()
    var [privileges, set_privileges] = useState()
    /* if pack_id is present in url query we set default option of parent pack select to that  */
    var pack_id = Number(search_params.get("pack_id"))
    if (pack_id) {
        var tmp = cache.find(
            (i) => i.thing.type === "unit/pack" && i.thing_id === pack_id
        )
        var default_selected_parent_pack = {
            value: pack_id,
            label: tmp.thing.value.title,
        }
    } else {
        var default_selected_parent_pack = {
            value: null,
            label: strings[192],
        }
    }
    var [selected_parent_pack, set_selected_parent_pack] = useState(
        default_selected_parent_pack
    )

    var user_id = uhc.user_id
    var nav = useNavigate()
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
    async function submit_new_pack() {
        var title = document.getElementById("title").value
        var description = document.getElementById("description").value
        try {
            var tmp = {
                title,
                description,
            }

            var id_of_new_pack = await window.uhc.request_new_transaction({
                new_thing_creator: (thing) => ({
                    value: tmp,
                    type: "unit/pack",
                }),
            })
            var corrosponding_meta = await window.uhc.request_new_transaction({
                new_thing_creator: (thing) => ({
                    type: "meta",
                    value: {
                        thing_privileges: privileges,
                        locks: [],
                        modify_thing_privilegs: user_id,
                        thing_id: id_of_new_pack,
                        pack_id: selected_parent_pack.value,
                    },
                }),
            })
            alert(strings[64])
            if (!create_more) {
                nav(`/dashboard/${id_of_new_pack}`)
            }
        } catch (error) {
            console.log(error)
            alert(strings[8])
        }
    }

    return (
        <div className="p-2">
            <h1>{strings[0]()}</h1>
            <h1 className="mt-2">{strings[193]}</h1>
            {/* here */}
            <input
                className="border border-blue-400 rounded px-1"
                id={strings[194]}
            />

            <h1 className="mt-2">{strings[195]}</h1>
            <textarea
                className="border border-blue-400 rounded px-1"
                id={"description"}
                rows={5}
            ></textarea>

            <PrivilegesEditor onChange={set_privileges} />
            <h1 className="mt-2">{strings[196]}</h1>
            <Select
                onChange={select_parent_pack}
                value={selected_parent_pack}
                options={[
                    { label: strings[192], value: null },
                    ...cache
                        .filter((i) => i.thing.type === "unit/pack")
                        .map((i) => {
                            return {
                                value: i.thing_id,
                                label: i.thing.value.title,
                            }
                        }),
                ]}
            />
            <StyledDiv onClick={submit_new_pack} className="w-fit mt-2">
                {strings[202]}
            </StyledDiv>
            <CreateMore
                onchange={(new_state) => {
                    set_create_more(new_state)
                }}
            />
        </div>
    )
};
