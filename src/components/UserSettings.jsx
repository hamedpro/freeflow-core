import React, { useContext } from "react";
import { Section } from "./section";
import Select from "react-select";
import { StyledDiv } from "./styled_elements";
import axios from "axios";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
export const UserSettings = () => {
	var { cache, strings } = useContext(UnifiedHandlerClientContext)

    var user_id = uhc.user_id
    var user = cache.find((i) => i.thing_id === user_id)
    if (user === undefined) {
        return strings[160](user_id)
    }

    var values = user.thing.value
    var { calendar_type, week_starting_day, language } = values

    async function simple_update(key, new_value) {
        var user_private_data_thing_id = Number(
            uhc.unresolved_cache
                .find((i) => i.thing_id === user_id)
                .thing.value.mobile.split(":")[2]
        )
        if (
            [
                "calendar_type",
                "week_starting_day",
                "language",
                "mobile",
                "email_address",
            ].includes(key)
        ) {
            await uhc.request_new_transaction({
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: { ...prev.value, [key]: new_value },
                }),
                thing_id: user_private_data_thing_id,
            })
        } else if (["username", "full_name"].includes(key)) {
            await uhc.request_new_transaction({
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: { ...prev.value, [key]: new_value },
                }),
                thing_id: user_id,
            })
        }
    }
    async function set_profile_picture() {
        var [file] = document.getElementById("new_profile_image_input").files
        if (!file) {
            alert(strings[161])
            return
        }
        var f = new FormData()
        f.append("file", file)
        var profile_image_file_id = (
            await uhc.configured_axios({
                url: "/files",
                data: f,
                method: "post",
            })
        ).data
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, profile_image_file_id },
            }),
            thing_id: user_id,
        })
    }
    async function import_exported_unit() {
        alert(strings[65])
        return
        var files = document.getElementById("importing_exported_unit").files
        if (files.length !== 1) {
            alert("Error : selected files count is invalid")
            return
        }
        var f = new FormData()
        f.append("file", files[0])
        var uploaded_file_id = (
            await axios({
                baseURL: window.api_endpoint,
                url: "/v2/files",
                method: "post",
                data: f,
            })
        ).data.file_id
        try {
            var response = await axios({
                baseURL: window.api_endpoint,
                method: "post",
                data: {
                    file_id: uploaded_file_id,
                },
                url: "/import_exported_file",
            })
            alert("done !")
        } catch (error) {
            console.log(error)
            alert("something went wrong, details are in console")
        }

        await get_global_data()
    }
    return (
        <>
            <div className="p-2">
                <h1>{strings[162]}</h1>
                <div style={{ width: "200px", height: "200px" }}>
                    {user.thing.value.profile_image_file_id ? (
                        <img
                            src={
                                new URL(
                                    `/files/${
                                        user.thing.value.profile_image_file_id
                                    }?${uhc.jwt && "jwt=" + uhc.jwt}`,
                                    window.RESTFUL_API_ENDPOINT
                                ).href
                            }
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full bg-blue-600"></div>
                    )}
                </div>
                <input
                    type="file"
                    id="new_profile_image_input"
                    className="mt-2 block "
                />
                <StyledDiv onClick={set_profile_picture} className="w-fit mt-2">
                    {strings[163]}
                </StyledDiv>
            </div>
            <Section title={strings[164]}>
                <input type="file" id="importing_exported_unit" />
                <StyledDiv
                    className="w-fit mt-2"
                    onClick={import_exported_unit}
                >
                    {strings[165]}
                </StyledDiv>
            </Section>
            <Section title={strings[166]}>
                <Select
                    onChange={(e) => simple_update("calendar_type", e.value)}
                    options={[
                        { value: null, label: strings[167] },
                        {
                            value: "english",
                            label: strings[170],
                        },
                        {
                            value: "arabic",
                            label: strings[169],
                        },
                        {
                            value: "persian",
                            label: strings[168],
                        },
                    ]}
                    value={{
                        value: calendar_type || null,
                        label: !calendar_type ? strings[167] : calendar_type,
                    }}
                />
            </Section>

            <Section title={strings[171]}>
                <Select
                    onChange={(e) =>
                        simple_update("week_starting_day", e.value)
                    }
                    options={[
                        { value: null, label: strings[167] },
                        {
                            label: strings[172],
                            options: [
                                { value: "saturday", label: strings[173] },
                                { value: "sunday", label: strings[174] },
                                { value: "monday", label: strings[175] },
                            ],
                        },

                        {
                            label: strings[180],

                            options: [
                                { value: "tuesday", label: strings[176] },
                                { value: "wednesday", label: strings[177] },
                                { value: "thursday", label: strings[178] },
                                { value: "friday", label: strings[179] },
                            ],
                        },
                    ]}
                    value={{
                        value: week_starting_day || null,
                        label: !week_starting_day
                            ? strings[167]
                            : week_starting_day,
                    }}
                />
            </Section>
            <Section title={strings[181]}>
                <Select
                    onChange={(e) => simple_update("language", e.value)}
                    options={[
                        { value: null, label: strings[167] },
                        { value: "english", label: strings[182] },
                        { value: "persian", label: strings[183] },
                    ]}
                    value={{
                        value: language || null,
                        label: !language ? strings[167] : language,
                    }}
                />
            </Section>
            <Section title={strings[184]}>
                {[
                    { key: "email_address", label: strings[185] },
                    { key: "mobile", label: strings[186] },
                    { key: "username", label: strings[187] },
                    { key: "full_name", label: strings[188] },
                ].map((i, index) => {
                    return (
                        <div key={index} className="block">
                            {values[i.key] ? (
                                <>
                                    <span>{i.label}</span> : {values[i.key]}
                                </>
                            ) : (
                                <>
                                    <span>{i.label}</span> :{" "}
                                    <span>{strings[189]}</span>
                                </>
                            )}
                            <button
                                className="border border-green-600 rounded  px-2 ml-2"
                                onClick={() => {
                                    simple_update(
                                        i,
                                        window.prompt(strings[62](i.key))
                                    )
                                }}
                            >
                                {strings[190]}
                            </button>
                        </div>
                    )
                })}
            </Section>
        </>
    )
};
