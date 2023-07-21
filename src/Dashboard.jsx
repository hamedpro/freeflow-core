import React, { useContext, useState } from "react"
import "./App.css"
import "./output.css"
import { useNavigate } from "react-router-dom"
import "react-contexify/ReactContexify.css"
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { FileUpload } from "primereact/fileupload"
function ProfilesDropdown() {
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    function select_profile(new_user_id) {
        set_virtual_local_storage((prev) => ({
            ...prev,
            profiles_seed: prev.profiles_seed.map((seed) => ({
                ...seed,
                is_active: seed.user_id === new_user_id,
            })),
        }))
    }
    var dropdown_options = profiles_seed.map((profile) => {
        var label = `${strings[46]} #${profile.user_id}`
        if (profile.user_id === 0) {
            label = strings[47]
        } else if (profile.user_id === -1) {
            label = strings[48]
        } else {
            var t = cache.find(
                (cache_item) => cache_item.thing_id === profile.user_id
            )
            if (t !== undefined) {
                label =
                    t.thing.value.email_address ||
                    t.thing.value.mobile ||
                    t.thing.value.full_name
            }
        }
        return {
            code: profile.user_id,
            label,
            is_active: profile.is_active,
        }
    })
    function template(option) {
        var profile_image_file_id = cache.find(
            (cache_item) => cache_item.thing_id === option.code
        )?.thing.value?.profile_image_file_id
        return (
            <div className="flex items-center px-2 space-x-2">
                {option.code === -1 && <i className="bi-person-fill pr-2"> </i>}
                {option.code === 0 && <i className="bi-people pr-2"> </i>}
                {option.code > 0 &&
                    (profile_image_file_id ? (
                        <img
                            src={
                                new URL(
                                    `/files/${profile_image_file_id}?${
                                        uhc.jwt && "jwt=" + uhc.jwt
                                    }`,
                                    window.RESTFUL_API_ENDPOINT
                                ).href
                            }
                            style={{
                                width: "25px",
                                height: "25px",
                                borderRadius: "100%",
                            }}
                        />
                    ) : (
                        <i className="bi-person pr-2"></i>
                    ))}
                <span>{option.label}</span>
            </div>
        )
    }
    return (
        <Dropdown
            options={dropdown_options}
            value={dropdown_options.find(
                (profile) => profile.is_active === true
            )}
            onChange={(option) => select_profile(option.value.code)}
            optionLabel="label"
            valueTemplate={template}
            itemTemplate={template}
            className="w-fit"
        ></Dropdown>
    )
}
function MetroButton({ bi, text, link }) {
    var nav = useNavigate()
    return (
        <button
            className={[
                "bg-blue-500",
                "h-20",
                "text-white",
                "flex",
                "items-center",
                "justify-center",
                "w-56",
                "hover:bg-blue-600",
                "duration-200",
            ].join(" ")}
            onClick={() => nav(link)}
        >
            <i
                className={`text-3xl ${bi} hover:bg-blue-900 duration-300 rounded-lg p-1`}
            />
            <span className="">{text}</span>
        </button>
    )
}
export function Dashboard() {
    var [date, setDate] = useState()
    var { strings } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    return (
        <div className="h-full w-full border-black-900 flex flex-col overflow-hidden">
            <ProfilesDropdown />
            <MetroButton
                bi={"bi-person-fill-gear"}
                text="Settings"
                link={`/settings`}
            />
            <MetroButton
                bi={"bi-person-lines-fill"}
                text="My Active Profile"
                link={`/${uhc.user_id}`}
            />
            <MetroButton
                bi={"bi-clock-history"}
                text={strings[49]}
                link={"/time_machine"}
            />

            <MetroButton
                bi={"bi-bell-fill"}
                text="Changes Feed"
                link={"/feed"}
            />

            <MetroButton
                bi={strings[50]}
                text={"Go Premium"}
                link={"/subscription"}
            />

            <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                inline
                showWeek
                className="m-3 w-1/2"
            />
            <FileUpload
                name="file"
                url={window.RESTFUL_API_ENDPOINT}
                multiple
                emptyTemplate={
                    <p className="m-0">
                        Drag and drop files to here to upload.
                    </p>
                }
            />
        </div>
    )
}
