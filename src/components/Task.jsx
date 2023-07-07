import React, { useContext } from "react"
import { custom_axios_download } from "../../api/client"

import { Item, Menu, useContextMenu } from "react-contexify"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
export const Task = ({ cache_item }) => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var { show } = useContextMenu({
        id: "options_context_menu",
    })
    async function toggle_step_state(step_index) {
        var tmp = uhc.find_thing_meta(cache_item.thing_id).thing.value
            .thing_privileges.write
        if (tmp !== "*" && !tmp.includes(uhc.user_id)) {
            alert(strings[61])
            return
        }
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: {
                    ...prev.value,
                    steps: prev.value.steps.map((step, index) =>
                        index === step_index
                            ? { ...step, is_done: !step.is_done }
                            : step
                    ),
                },
            }),
            thing_id: cache_item.thing_id,
        })
    }
    async function change_task_handler(type) {
        var user_input = window.prompt(strings[62](type))
        if (user_input === null) return
        if (user_input === "") {
            alert(strings[63])
            return
        }

        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev, [type]: user_input },
            }),
            thing_id: cache_item.thing_id,
        })
        alert(strings[64])
    }

    async function export_unit_handler() {
        alert(strings[65])
        return
        await custom_axios_download({
            file_name: `tasks-${task_id}-at-${new Date().getTime()}.tar`,
            url: new URL(
                `/v2/export_unit?unit_id=${task_id}&unit_context=tasks`,
                window.api_endpoint
            ),
        })
    }
    return (
        <>
            <Menu id="options_context_menu">
                <Item
                    id="change_title"
                    onClick={() => change_task_handler("title")}
                >
                    {strings[66]}
                </Item>
                <Item
                    id="change_description"
                    onClick={() => change_task_handler("description")}
                >
                    {strings[67]}
                </Item>

                <Item id="export_unit" onClick={export_unit_handler}>
                    {strings[69]}
                </Item>
            </Menu>
            <div className="p-4">
                <div className="flex justify-between mb-1 items-center">
                    <h1 className="text-lg">{strings[85]}</h1>
                    <button
                        className="items-center flex"
                        onClick={(event) => show({ event })}
                    >
                        <i className="bi-list text-lg" />{" "}
                    </button>
                </div>
                <div className="p-1">
                    <h1 className="mt-2">{strings[121]}</h1>
                    <p>
                        {strings[122]} {cache_item.thing.value.end_date}
                    </p>
                    <p>
                        {strings[123]} {cache_item.thing.value.start_date}
                    </p>
                    <p>
                        {strings[72]} {cache_item.thing.value.title}
                    </p>
                    <p>
                        {strings[124]} {cache_item.thing.value.category_id}
                    </p>
                    <p>
                        {strings[73]} {cache_item.thing.value.description}
                    </p>
                    <h3>{strings[125]}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>{strings[82]}</th>
                                <th>{strings[73]}</th>
                                <th>{strings[126]}</th>
                                <th>{strings[127]} </th>
                            </tr>
                        </thead>
                        <tbody>
                            {cache_item.thing.value.steps.map((step, index) => (
                                <tr key={index}>
                                    <td>{step.title}</td>
                                    <td>{step.description}</td>
                                    <td>{step.percent}</td>
                                    <td
                                        onClick={() => toggle_step_state(index)}
                                    >
                                        {step.is_done === true ? (
                                            <i className="bi-toggle-on" />
                                        ) : (
                                            <i className="bi-toggle-off" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
