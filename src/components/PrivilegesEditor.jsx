import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
export const PrivilegesEditor = ({ onChange }) => {
	var { cache, strings } = useContext(UnifiedHandlerClientContext)
	var users = cache.filter((i) => i.thing.type === "user");
	var [privileges, set_privileges] = useState({
		read: [],
		write: [],
	});
	function change_privilegs_mode(job, new_value) {
		set_privileges((prev) => ({ ...prev, [job]: new_value === "not_all" ? [] : "*" }));
	}
	useEffect(() => {
		onChange(privileges);
	}, [privileges]);
	return (
        <>
            <h1>{strings[197]}</h1>
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
                            onClick={() => change_privilegs_mode(key, "all")}
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
                                change_privilegs_mode(key, "not_all")
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
                                    label: i.thing.value.username,
                                }))}
                                value={users
                                    .filter((i) =>
                                        privileges[key].includes(i.thing_id)
                                    )
                                    .map((i) => ({
                                        value: i.thing_id,
                                        label: i.thing.value.username,
                                    }))}
                                onChange={(newValue) =>
                                    set_privileges((prev) => ({
                                        ...prev,
                                        [key]: newValue.map((i) => i.value),
                                    }))
                                }
                            />
                        )}
                    </div>
                </div>
            ))}
        </>
    )
};
