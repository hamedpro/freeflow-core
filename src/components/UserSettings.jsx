import React, { useContext, useEffect, useState } from "react"
import { Section } from "./section"
import Select from "react-select"
import { StyledDiv } from "./styled_elements"
import axios from "axios"
import { JsonViewer } from "@textea/json-viewer"
import validator from "validator"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { GoBackRow } from "./GoBackRow"
import { Card } from "primereact/card"
import { CustomNavBar } from "./CustomNavBar"
import { FileUpload } from "primereact/fileupload"
import { Typography } from "@mui/material"
import { Panel } from "primereact/panel"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { InputSwitch } from "primereact/inputswitch"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
function ExportProfile() {
    var { profiles_seed } = useContext(VirtualLocalStorageContext)
    var [include_files_checkbox, set_include_files_checkbox] = useState(true)
    return (
        <Panel header="Export Profile">
            <div className="grid grid-cols-12 gap-x-2">
                <p className=" col-span-7">
                    we have a open network which brings a great flexibility.
                    everything in our network is stored as transactions. whether
                    its a unit like a note or ask or even all users, etc. each
                    account has access to a part of those transactions and it
                    calculate cache based on them.
                    <br />
                    <br />
                    if you are concerned about data loss or whatever, you can
                    download all of them inside a single archive by a single
                    click!
                </p>
                <div className=" col-span-5 border-l border-gray-200 pl-4">
                    <label>your current profile seed: </label>
                    <JsonViewer
                        sx={{ fontSize: "small" }}
                        value={profiles_seed.find(
                            (ps) => ps.is_active === true
                        )}
                    />
                    <p
                        htmlFor="include_files"
                        className="my-2"
                    >
                        include files:
                    </p>

                    <InputSwitch
                        inputId="include_files"
                        checked={include_files_checkbox}
                        onChange={(e) => set_include_files_checkbox(e.value)}
                    />
                    <Button
                        icon={<i className="bi-cloud-download pr-2" />}
                        className="w-full my-3 flex justify-center"
                    >
                        Download Archive
                    </Button>
                </div>
            </div>
        </Panel>
    )
}
function ChangeCredential({ user, strings, simple_update }) {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var [biography, set_biography] = useState()
    var [full_name, set_full_name] = useState()
    var [email_address, set_email_address] = useState()
    var [verf_code_status, set_verf_code_status] = useState("sent") // or sent or failed
    useEffect(() => {
        set_biography(user.thing.value.biography)
    }, [user.thing.value.biography])

    useEffect(() => {
        set_full_name(user.thing.value.full_name)
    }, [user.thing.value.full_name])

    useEffect(() => {
        set_email_address(user.thing.value.email_address)
    }, [user.thing.value.email_address])
    var available_and_valid_email =
        validator.isEmail(email_address || "") &&
        cache.find(
            (ci) =>
                ci.thing.type === "user" &&
                ci.thing.value.email_address === email_address
        ) === undefined
    return (
        <Panel header={strings[184]}>
            <div className="grid grid-cols-2">
                <div className="col-span-1">
                    <label
                        htmlFor="change_email"
                        className="text-lg"
                    >
                        {strings[185] + ":"}
                    </label>
                    <br />

                    <InputText
                        id="change_email"
                        style={{ wordBreak: "break-all" }}
                        value={email_address || ""}
                        onChange={(e) => {
                            set_email_address(e.target.value)
                        }}
                    />
                    {/* {available_and_valid_email && email_address !== user.thing.value.email_address && 
                        ""} */}

                    <br />
                    <br />
                    <label
                        htmlFor="change_full_name"
                        className="text-lg"
                    >
                        {strings[188] + ":"}
                    </label>
                    <br />
                    <div className="p-inputgroup w-fit">
                        <InputText
                            id="change_full_name"
                            value={full_name || ""}
                            onChange={(e) => set_full_name(e.target.value)}
                        />
                        {user.thing.value.full_name !== full_name && (
                            <Button
                                icon={<i className="bi-pencil-square" />}
                                onClick={() =>
                                    simple_update("full_name", full_name)
                                }
                            />
                        )}
                    </div>
                </div>
                <div className="col-span-1">
                    <label
                        htmlFor="change_biography"
                        className="text-lg"
                    >
                        {"biography" + ":"}
                    </label>
                    <br />
                    <InputTextarea
                        id="change_biography"
                        className="w-full"
                        rows={5}
                        value={biography || ""}
                        onChange={(e) => set_biography(e.target.value)}
                    />
                    {user.thing.value.biography !== biography && (
                        <Button
                            className="w-full text-sm h-10 flex justify-center"
                            onClick={() =>
                                simple_update("biography", biography)
                            }
                        >
                            <i className="bi-pencil-square pr-2" />
                            Update Biography
                        </Button>
                    )}
                </div>
            </div>
        </Panel>
    )
}
function CalendarRelated({ strings, user, simple_update }) {
    var { calendar_type, week_starting_day, language } = user.thing.value

    return (
        <div className="grid grid-cols-12 my-4 gap-x-4">
            <div className="col-span-6">
                <Panel header={"Calendar Related"}>
                    <span>{strings[166]}</span>
                    <Select
                        onChange={(e) =>
                            simple_update("calendar_type", e.value)
                        }
                        options={[
                            { value: null, label: strings[167] },
                            {
                                value: "english",
                                label: strings[170],
                            },
                            {
                                value: "persian",
                                label: strings[168],
                            },
                        ]}
                        value={{
                            value: calendar_type || null,
                            label: !calendar_type
                                ? strings[280]
                                : calendar_type,
                        }}
                    />
                    <br />
                    <span className="mt-4">{strings[171]}</span>
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
                                ? strings[280]
                                : week_starting_day,
                        }}
                    />
                    <br />
                    <span className="mt-4">{strings[181]}</span>
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
                </Panel>
            </div>
            <div className="col-span-6">
                <Panel header={"Previews"}>
                    <div className="h-full w-full flex justify-center items-center flex-col space-y-5">
                        <Calendar
                            inline
                            className="w-full"
                        />
                        <span>{new Date().toLocaleString("fa-IR")}</span>
                    </div>
                </Panel>
            </div>
        </div>
    )
}
export const UserSettings = () => {
    var { cache, strings } = useContext(UnifiedHandlerClientContext)

    var user_id = uhc.user_id
    var user = cache.find((i) => i.thing_id === user_id)
    if (user === undefined) {
        return strings[160](user_id)
    }

    var values = user.thing.value

    async function simple_update(key, new_value) {
        var user_private_data_thing_id = Number(
            uhc.unresolved_cache
                .find((i) => i.thing_id === user_id)
                .thing.value.password.split(":")[2]
        )
        if (["calendar_type", "week_starting_day", "language"].includes(key)) {
            await uhc.request_new_transaction({
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: { ...prev.value, [key]: new_value },
                }),
                thing_id: user_private_data_thing_id,
            })
        } else if (["email_address", "full_name", "biography"].includes(key)) {
            await uhc.request_new_transaction({
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: { ...prev.value, [key]: new_value },
                }),
                thing_id: user_id,
            })
        }
    }
    async function set_profile_picture(props) {
        var [file] = props.files
        if (!file) {
            alert(strings[161])
            return
        }
        try {
            var f = new FormData()
            f.append("file", file)
            f.append("file_privileges", JSON.stringify({ read: "*" }))
            var { new_file_id, meta_id_of_file } = (
                await uhc.configured_axios({
                    url: "/files",
                    data: f,
                    method: "post",
                })
            ).data
            //file is uploaded, now give its access to everyone

            await uhc.request_new_transaction({
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: {
                        ...prev.value,
                        profile_image_file_id: new_file_id,
                    },
                }),
                thing_id: user_id,
            })
        } catch (e) {
            console.log(e)
            alert("something went wrong. see more in console")
        } finally {
            props.options.clear()
        }
    }

    return (
        <>
            <CustomNavBar
                back_text={"Dashboard"}
                back_link={"/"}
                main_text={"Preferences: let us know what you prefer."}
            />
            <div
                className="grid grid-cols-3 w-full  bg-gray-100  rounded overflow-hidden mb-4"
                style={{
                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        position: "relative",
                        aspectRatio: "1",
                    }}
                    className="col-span-1 col-start-1 grid place-items-center border-r border-gray-200"
                >
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
                            className="w-full aspect-auto"
                        />
                    ) : (
                        <div className="w-full h-full bg-blue-600 grid place-items-center">
                            <i className="bi bi-person-vcard-fill text-white text-6xl" />
                        </div>
                    )}
                    <FileUpload
                        customUpload
                        uploadHandler={set_profile_picture}
                        className="absolute bottom-0 text-xs"
                        pt={{
                            root: { style: { width: "100%" } },
                        }}
                        mode="basic"
                        accept="image/*"
                        chooseOptions={{
                            icon: <i className="bi-cloud-upload-fill pr-2" />,
                            className: "w-full rounded-none",
                            style: {
                                left: "50%",
                                transform: "translateX(-50%)",
                            },
                        }}
                        chooseLabel="New Picture"
                    />
                </div>
                <div className="h-full col-start-2 col-span-2 p-4">
                    <h3 className="text-blue-500 text-4xl">
                        {user.thing.value.full_name || "no name"}
                    </h3>
                    <p className="text-gray-700">
                        <i className="bi bi-envelope-at-fill" />{" "}
                        {user.thing.value.email_address}
                    </p>
                    <br />
                    <p className="text-gray-700">
                        <i className="bi-person-vcard-fill pr-1" />
                        <span className="">Biography: </span>
                        <span className="text-black">
                            {user.thing.value.biography ||
                                "this user has not a biography"}
                        </span>
                    </p>
                    <p className="text-gray-700">
                        <i className="bi-award pr-1" />
                        Repuation Level:{" "}
                        <span className="text-black">coming soon...</span>
                    </p>
                    <p className="text-gray-700">
                        <i className="bi-calendar4 pr-1" /> joined since{" "}
                        <span className="text-black">
                            {new Date(
                                window.uhc.find_first_transaction(user_id).time
                            ).toDateString()}
                        </span>
                    </p>
                </div>
            </div>
            <ExportProfile />
            <CalendarRelated
                user={user}
                strings={strings}
                simple_update={simple_update}
            />
            <ChangeCredential
                user={user}
                strings={strings}
                simple_update={simple_update}
            />
        </>
    )
}
