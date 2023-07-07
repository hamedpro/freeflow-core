import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

import { StyledDiv } from "./styled_elements";
import { Section } from "./section";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
import { CreateMore } from "./CreateMore";
export const NewAsk = () => {
    var [create_more, set_create_more] = useState()

    var nav = useNavigate()
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var [selected_mode, set_selected_mode] = useState("poll") //possible modes : "poll" , "multiple_choice" , "text_answer"

    var [current_mode_options, set_current_mode_options] = useState([])
    //if selected_mode is poll or multiple_choice
    //it holds those its options

    var [
        multiple_choice_correct_option_index,
        set_multiple_choice_correct_option_index,
    ] = useState()

    var [privileges, set_privileges] = useState()

    var [search_params, set_search_params] = useSearchParams()

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
    async function submit_new_ask() {
        //early terminatios :
        if (
            selected_mode === "multiple_choice" &&
            multiple_choice_correct_option_index === undefined
        ) {
            alert(strings[237])
            return
        }

        try {
            var tmp = {
                question: document.getElementById("question").value,
            }

            //appending options
            if (selected_mode === "poll") {
                tmp.options = current_mode_options
            } else if (selected_mode === "multiple_choice") {
                tmp.options = current_mode_options
                tmp.correct_option_index = multiple_choice_correct_option_index
            }

            //assiging mode :
            tmp.mode = selected_mode
            /* console.log(tmp, privileges);
			return; */
            var new_ask_id = await uhc.request_new_transaction({
                new_thing_creator: () => ({
                    type: "unit/ask",
                    value: tmp,
                }),
                thing_id: undefined,
            })
            var meta_id = await uhc.request_new_transaction({
                new_thing_creator: () => ({
                    type: "meta",
                    value: {
                        thing_privileges: privileges,
                        modify_thing_privileges: uhc.user_id,
                        locks: [],
                        pack_id: selected_parent_pack.value,
                        thing_id: new_ask_id,
                    },
                }),
            })
            alert(strings[64])
            if (!create_more) {
                nav(`/dashboard/${new_ask_id}`)
            }
        } catch (error) {
            console.log(error)
            alert(strings[8])
        }
    }

    var [selected_parent_pack, set_selected_parent_pack] = useState(() => {
        var pack_id = Number(search_params.get("pack_id"))
        if (pack_id) {
            let tmp = cache.find((i) => i.thing_id === pack_id)
            return {
                value: tmp.thing_id,
                label: tmp.thing.value.type,
            }
        } else {
            return { value: null, label: strings[192] }
        }
    })
    function add_new_option() {
        set_current_mode_options((prev) => [
            ...prev,
            window.prompt(strings[238]),
        ])
    }

    return (
        <div className="p-2">
            <h1>{strings[240]}</h1>

            <h1 className="mt-2">{strings[241]}</h1>
            <input
                id="question"
                className="border border-blue-400 px-1 rounded"
            />
            <PrivilegesEditor onChange={set_privileges} />
            <p>{strings[242]}</p>
            {["multiple_choice", "poll", "text_answer"].map((mode) => (
                <div onClick={() => set_selected_mode(mode)} key={mode}>
                    <i
                        className={
                            selected_mode === mode
                                ? "bi-toggle-on"
                                : "bi-toggle-off"
                        }
                    />{" "}
                    {mode === "multiple_choice" && <span>{strings[243]}</span>}
                    {mode === "poll" && <span>{strings[244]}</span>}
                    {mode === "text_answer" && <span>{strings[245]}</span>}
                </div>
            ))}
            {selected_mode !== "text_answer" && (
                <Section title={strings[246]}>
                    {(selected_mode === "poll" ||
                        selected_mode === "multiple_choice") && (
                        <>
                            <button onClick={add_new_option}>
                                {strings[247]}
                            </button>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{strings[248]}</th>
                                        <th>{strings[249]}</th>
                                        {selected_mode ===
                                            "multiple_choice" && (
                                            <th>{strings[250]}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {current_mode_options.map(
                                        (option, index) => (
                                            <tr
                                                key={Math.round(
                                                    Math.random() * 1000
                                                )}
                                            >
                                                <td>{index}</td>
                                                <td>{option}</td>
                                                {selected_mode ===
                                                    "multiple_choice" && (
                                                    <td>
                                                        {index ===
                                                        multiple_choice_correct_option_index
                                                            ? strings[251]
                                                            : strings[252]}
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                    {selected_mode === "multiple_choice" && (
                        <button
                            onClick={() =>
                                set_multiple_choice_correct_option_index(
                                    Number(prompt(strings[253]))
                                )
                            }
                        >
                            {strings[254]}
                        </button>
                    )}
                </Section>
            )}
            <h1 className="mt-2">{strings[230]}</h1>
            <Select
                onChange={select_parent_pack}
                value={selected_parent_pack}
                options={[
                    { value: null, label: strings[192] },
                    ...cache
                        .filter((i) => i.thing.type === "unit/pack")
                        .map((cache_item) => {
                            return {
                                value: cache_item.thing_id,
                                label: cache_item.thing.value.title,
                            }
                        }),
                ]}
                isSearchable
            />
            <StyledDiv onClick={submit_new_ask} className="w-fit mt-2">
                {strings[255]}
            </StyledDiv>
            <CreateMore
                onchange={(new_state) => {
                    set_create_more(new_state)
                }}
            />
        </div>
    )
};
