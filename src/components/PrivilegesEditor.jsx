import React, { useContext } from "react"
import Select from "react-select"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Panel } from "primereact/panel"
export const PrivilegesEditor = ({ cache_item, ...props }) => {
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var users = cache.filter((i) => i.thing.type === "user")

    var privileges =
        cache_item.its_meta_cache_item?.thing.value.thing_privileges
    async function apply_changes(changer_func) {
        var new_privileges = changer_func(
            JSON.parse(JSON.stringify(privileges))
        )
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, thing_privileges: new_privileges },
            }),
            thing_id: cache_item.its_meta_cache_item.thing_id,
        })
    }
    if (privileges === undefined) {
        return "thing privileges could not be found."
    }
    return (
        <Panel
            header={strings[197]}
            {...props}
        >
            {["read", "write"].map((key) => (
                <div key={key}>
                    <div>
                        <h1>
                            {key === "read" ? strings[198] : strings[199]} :{" "}
                        </h1>
                        <i
                            className={
                                typeof privileges[key] === "string"
                                    ? "bi-toggle-on"
                                    : "bi-toggle-off"
                            }
                            onClick={() =>
                                apply_changes((prev) => {
                                    prev[key] = "*"
                                    return prev
                                })
                            }
                        >
                            {strings[200]}
                        </i>
                        <i
                            className={
                                typeof privileges[key] !== "string"
                                    ? "bi-toggle-on"
                                    : "bi-toggle-off"
                            }
                            onClick={() =>
                                apply_changes((prev) => {
                                    prev[key] = [uhc.user_id]
                                    return prev
                                })
                            }
                        >
                            {strings[201]}
                        </i>
                    </div>
                    <div>
                        {typeof privileges[key] !== "string" && (
                            <Select
                                isMulti
                                options={users.map((i) => ({
                                    value: i.thing_id,
                                    label: i.thing.value.email_address,
                                }))}
                                value={users
                                    .filter((i) =>
                                        privileges[key].includes(i.thing_id)
                                    )
                                    .map((i) => ({
                                        value: i.thing_id,
                                        label: i.thing.value.email_address,
                                    }))}
                                onChange={(newValue) =>
                                    apply_changes((prev) => {
                                        prev[key] = newValue.map(
                                            (something) => something.value
                                        )
                                        return prev
                                    })
                                }
                            />
                        )}
                    </div>
                </div>
            ))}
        </Panel>
    )
}
