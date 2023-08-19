import React, { useContext, useEffect, useState } from "react"
import Select from "react-select"
import JsFileDownloader from "js-file-downloader"
import { JsonViewer } from "@textea/json-viewer"
import validator from "validator"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { CustomNavBar } from "./CustomNavBar"
import { FileUpload } from "primereact/fileupload"
import { Panel } from "primereact/panel"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { InputSwitch } from "primereact/inputswitch"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import PersianDate from "persian-date"
import { addLocale, updateLocaleOption } from "primereact/api"
import { day_names } from "../../common_helpers"
import { Password } from "primereact/password"
import { Profiles } from "./Profiles"
function ExportProfile() {
    var { profiles_seed } = useContext(VirtualLocalStorageContext)
    var [include_files_checkbox, set_include_files_checkbox] = useState(true)
    async function download_backup() {
        new JsFileDownloader({
            url: new URL("/export_backup", window.RESTFUL_API_ENDPOINT).href,
            body: JSON.stringify({
                include_files: include_files_checkbox,
                profile_seed: profiles_seed.find((ps) => ps.is_active === true),
            }),
            method: "POST",
            contentType: "application/json",
            filename: "freeflow_backup.tar",
        })
    }

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
                        onClick={download_backup}
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
    var [verf_code_status, set_verf_code_status] = useState() // progress , sent , failed
    var [verf_code, set_verf_code] = useState()
    var [email_address, set_email_address] = useState()
    var [password, set_password] = useState()
    useEffect(() => {
        set_biography(user.thing.value.biography)
    }, [user.thing.value.biography])

    useEffect(() => {
        set_full_name(user.thing.value.full_name)
    }, [user.thing.value.full_name])
    useEffect(() => {
        set_password(user.thing.value.password)
    }, [user.thing.value.password])

    useEffect(() => {
        set_email_address(user.thing.value.email_address)
    }, [user.thing.value.email_address])
    var email_is_valid = validator.isEmail(email_address || "")

    var tmp = cache.find(
        (ci) =>
            ci.thing.type === "user" &&
            ci.thing.value.email_address === email_address
    )

    var email_is_taken_by_someone_else =
        tmp !== undefined && tmp.thing_id !== user.thing_id
    useEffect(() => {
        if (
            email_is_valid &&
            !email_is_taken_by_someone_else &&
            user.thing.value.email_address !== email_address
        ) {
            set_verf_code_status("progress")
            window.uhc
                .configured_axios({
                    url: "/send_verification_code",
                    data: {
                        email_address,
                    },
                    method: "post",
                })
                .then(
                    (done) => {
                        set_verf_code_status("sent")
                    },
                    () => {
                        set_verf_code_status("failed")
                    }
                )
        }
    }, [
        email_is_valid,
        !email_is_taken_by_someone_else,
        user.thing.value.email_address !== email_address,
        email_address,
    ])
    async function change_email() {
        try {
            await uhc.configured_axios({
                method: "post",
                data: {
                    email_address,
                    verf_code: Number(verf_code),
                },
                url: "/change_email",
            })
        } catch (error) {
            if (error.response.status === 403) {
                alert(error.response.data)
            } else {
                console.log(error)
                alert(
                    "something went wrong in network. more details in console."
                )
            }
        }
    }
    return (
        <div className="grid grid-cols-1 gap-x-4">
            <label
                htmlFor="change_full_name"
                className="text-lg"
            >
                {strings[188] + ":"}
            </label>

            <div
                className="p-inputgroup mb-4"
                style={{ width: "100%" }}
            >
                <InputText
                    id="change_full_name"
                    value={full_name || ""}
                    onChange={(e) => set_full_name(e.target.value)}
                />
                {user.thing.value.full_name !== full_name && (
                    <Button
                        icon={<i className="bi-pencil-square" />}
                        onClick={() => simple_update("full_name", full_name)}
                    />
                )}
            </div>
            <label
                htmlFor="change_email"
                className="text-lg"
            >
                {strings[185] + ":"}
            </label>

            <InputText
                id="change_email"
                style={{
                    wordBreak: "break-all",
                    width: "100%",
                    marginBottom: "5px",
                }}
                className="mb-4"
                value={email_address || ""}
                onChange={(e) => {
                    set_email_address(e.target.value)
                }}
            />
            <span className="pt-2">
                {email_is_taken_by_someone_else &&
                    "this email is taken by someone else."}
                {!email_is_valid && "invalid email"}
            </span>

            {email_is_valid &&
                !email_is_taken_by_someone_else &&
                user.thing.value.email_address !== email_address && (
                    <>
                        <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                            {verf_code_status === "failed" &&
                                "Error. could not send verification codes."}
                            {verf_code_status === "sent" &&
                                `verification code is sent.`}
                            {verf_code_status === "progress" &&
                                "sending verification code ..."}
                        </span>
                        <div
                            className="p-inputgroup"
                            style={{ marginBottom: "8px" }}
                        >
                            <InputText
                                placeholder="Enter verification code"
                                value={verf_code || ""}
                                onChange={(e) => set_verf_code(e.target.value)}
                            />
                            <Button onClick={change_email}>
                                <i className="bi-send-fill" />{" "}
                            </Button>
                        </div>
                    </>
                )}
            <label
                htmlFor="change_password"
                className="text-lg"
            >
                {"password" + ":"}
            </label>

            <div
                className="p-inputgroup mb-4"
                style={{ width: "100%" }}
            >
                <Password
                    toggleMask
                    className="w-full"
                    id="change_password"
                    value={password || ""}
                    onChange={(e) => set_password(e.target.value)}
                />
                {user.thing.value.password !== password && (
                    <Button
                        icon={<i className="bi-pencil-square" />}
                        onClick={() => simple_update("password", password)}
                    />
                )}
            </div>
            <label
                htmlFor="change_biography"
                className="text-lg"
            >
                {"biography" + ":"}
            </label>
            <InputTextarea
                id="change_biography"
                className="w-full"
                style={{ marginBottom: "8px" }}
                rows={8}
                value={biography || ""}
                onChange={(e) => set_biography(e.target.value)}
            />
            {user.thing.value.biography !== biography && (
                <Button
                    className="w-full text-sm h-10 flex justify-center"
                    onClick={() => simple_update("biography", biography)}
                >
                    <i className="bi-pencil-square pr-2" />
                    Update Biography
                </Button>
            )}
        </div>
    )
}
function CalendarRelated({ strings, user, simple_update }) {
    var { calendar_type, week_starting_day, language } = user.thing.value
    var pd = new PersianDate()

    addLocale("fa", {
        dayNames: [
            "یکشنبه",
            "دوشنبه",
            "سه شنبه",
            "چهارشنبه",
            "پنج شنبه",
            "جمعه",
            "شنبه",
        ],
        dayNamesShort: ["یک", "دو", "سه", "چهار", "پنج", "جمعه", "شنبه"],
        dayNamesMin: ["ی", "د", "س", "چ", "پ", "ج", "ش"],
        monthNames: [
            "فروردین",
            "اردیبهشت",
            "خرداد",
            "تیر",
            "مرداد",
            "شهریور",
            "مهر",
            "آبان",
            "آذر",
            "دی",
            "بهمن",
            "اسفند",
        ],
        monthNamesShort: [
            "فرو",
            "ارد",
            "خرد",
            "تیر",
            "مرد",
            "شهر",
            "مهر",
            "آبان",
            "آذر",
            "دی",
            "بهمن",
            "اسف",
        ],
        today: "امروز",
        clear: "پاک کن",
    })
    ;["en", "fa"].map((locale) => {
        updateLocaleOption(
            "firstDayOfWeek",
            day_names.indexOf(week_starting_day),
            locale
        )
    })

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
                            key={new Date().getTime()}
                            inline
                            className="w-full"
                            locale={calendar_type === "english" ? "en" : "fa"}
                        />
                        <span>{pd.format("LLLL")}</span>
                    </div>
                </Panel>
            </div>
        </div>
    )
}
export const UserSettings = () => {
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var { calendar_type } = useContext(VirtualLocalStorageContext)
    var user_id = uhc.user_id
    var user = cache.find((i) => i.thing_id === user_id)
    if (user === undefined) {
        return strings[160](user_id)
    }

    var values = user.thing.value
    var user_join_timestamp = window.uhc.find_first_transaction(user_id).time
    var pd = new PersianDate(user_join_timestamp)
    async function simple_update(key, new_value) {
        var user_private_data_thing_id = Number(
            uhc.unresolved_cache
                .find((i) => i.thing_id === user_id)
                .thing.value.password.split(":")[2]
        )
        if (
            [
                "calendar_type",
                "week_starting_day",
                "language",
                "password",
            ].includes(key)
        ) {
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
            <Profiles />
            <Panel
                className="mb-4"
                header={strings[184]}
            >
                <div className="grid grid-cols-2 gap-x-4">
                    <div
                        style={{
                            width: "100%",
                            position: "relative",
                            aspectRatio: "1",
                        }}
                        className="col-span-1 col-start-1 grid place-items-center"
                    >
                        {user.thing.value.profile_image_file_id ? (
                            <img
                                src={
                                    new URL(
                                        `/files/${
                                            user.thing.value
                                                .profile_image_file_id
                                        }?${uhc.jwt && "jwt=" + uhc.jwt}`,
                                        window.RESTFUL_API_ENDPOINT
                                    ).href
                                }
                                className="w-full aspect-auto"
                            />
                        ) : (
                            <div className="w-full bg-gray-50 flex items-center justify-center flex-col aspect-square rounded border border-gray-200">
                                <i className="bi bi-person-vcard-fill text-gray-700 text-6xl" />
                                <span>Profile picture is not set</span>
                            </div>
                        )}
                        <FileUpload
                            customUpload
                            uploadHandler={set_profile_picture}
                            className="bottom-0 text-xs mt-4"
                            pt={{
                                root: { style: { width: "100%" } },
                            }}
                            mode="basic"
                            accept="image/*"
                            chooseOptions={{
                                icon: (
                                    <i className="bi-cloud-upload-fill pr-2" />
                                ),
                                className: "w-full rounded-none",
                            }}
                            chooseLabel="Change Picture"
                        />
                    </div>
                    <ChangeCredential
                        user={user}
                        strings={strings}
                        simple_update={simple_update}
                    />
                </div>
            </Panel>

            <ExportProfile />
            <CalendarRelated
                user={user}
                strings={strings}
                simple_update={simple_update}
            />
        </>
    )
}
