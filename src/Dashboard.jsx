import React, { useContext } from "react";
import "./App.css";
import "./output.css";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { month_names } from "../common_helpers.js";
import { NewNote } from "./components/NewNote";
import { NewTask } from "./components/NewTask";
import { MonthCalendar } from "./components/MonthCalendar.jsx";
import { DayCalendar } from "./components/DayCalendar";
import { PrimarySideBar } from "./components/PrimarySideBar";
import { NewResource } from "./components/NewResource";
import { UserSettings } from "./components/UserSettings";
import { NewEvent } from "./components/NewEvent";
import { NewPack } from "./components/NewPack";
import "react-contexify/ReactContexify.css";
import { NewAsk } from "./components/NewAsk";
import { Stage } from "./components/Stage";
import { NewChat } from "./components/NewChat";
import { TimeMachine } from "./TimeMachine";
import ReactDropdown from "react-dropdown";
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import { CheckDefaultParentPack } from "./components/CheckDefaultParentPack";
import { Dropdown } from "primereact/dropdown"
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
                label = t.thing.value.username
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
export function Dashboard() {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    return (
        <div className="h-full w-full border-black-900 flex-col overflow-hidden">
            <div className="w-full h-14 bg-blue-600 flex items-center px-3 space-x-3">
                <div className="w-fit flex space-x-2">
                    <ProfilesDropdown />

                    <Link to={`/dashboard/settings`}>
                        <i
                            style={{ color: "white" }}
                            className="text-3xl bi-person-fill-gear hover:bg-blue-900 duration-300 rounded-lg p-1"
                        />
                    </Link>
                    <Link to={`/dashboard/${uhc.user_id}`}>
                        <i
                            style={{ color: "white" }}
                            className="text-3xl bi-person-lines-fill hover:bg-blue-900 duration-300 rounded-lg p-1"
                        />
                    </Link>
                    <Link to={`/dashboard/`}>
                        <i
                            style={{ color: "white" }}
                            className="bi-house-fill text-2xl hover:bg-blue-900 duration-300 rounded-lg p-1"
                        />
                    </Link>
                </div>
                <div className="w-full flex justify-between items-center h-full ">
                    <button
                        onClick={() => nav("/dashboard/time_machine")}
                        className="h-full text-white flex items-center space-x-2 hover:bg-blue-500 duration-300 px-2"
                    >
                        <i className="bi-clock-history" />
                        <b>{strings[49]}</b>
                    </button>
                    <div className="h-full text-white flex items-center space-x-2 hover:bg-blue-500 duration-300 px-2">
                        <i className="bi-calendar4"></i>
                        <div>
                            {new Date().getFullYear()} /{" "}
                            <Link to={`/dashboard/calendar/month`}>
                                {month_names[new Date().getMonth()]}
                            </Link>{" "}
                            /{" "}
                            {
                                <Link to={`/dashboard/calendar/day`}>
                                    {new Date().getDate()}
                                </Link>
                            }
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 h-5/6 my-2 py-2">
                        <i
                            style={{ color: "white" }}
                            className="text-2xl bi-bell-fill hover:bg-blue-900 duration-300 rounded-lg p-1"
                        />
                        <button className="px-2 rounded h-full flex justify-center items-center text-white bg-green-500">
                            <span>{strings[50]}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full flex" style={{ height: "92%" }}>
                <div
                    className=" bg-blue-500 overflow-y-auto h-full"
                    style={{ width: "13rem" }}
                >
                    <PrimarySideBar />
                </div>
                <div
                    className=" bg-blue-200 h-full overflow-y-auto h-9/10"
                    style={{ width: "calc(100% - 13rem)" }}
                >
                    <Routes>
                        <Route path="/:thing_id/*" element={<Stage />} />

                        <Route path="time_machine" element={<TimeMachine />} />

                        <Route path="settings" element={<UserSettings />} />

                        <Route
                            path="packs/new"
                            element={
                                <CheckDefaultParentPack
                                    children={<NewPack />}
                                />
                            }
                        />

                        <Route
                            path="resources/new"
                            element={
                                <CheckDefaultParentPack
                                    children={<NewResource />}
                                />
                            }
                        />

                        <Route
                            path="notes/new"
                            element={
                                <CheckDefaultParentPack
                                    children={<NewNote />}
                                />
                            }
                        />

                        <Route
                            path="tasks/new"
                            element={
                                <CheckDefaultParentPack
                                    children={<NewTask />}
                                />
                            }
                        />

                        <Route
                            path="events/new"
                            element={
                                <CheckDefaultParentPack
                                    children={<NewEvent />}
                                />
                            }
                        />
                        <Route
                            path="chats/new"
                            element={
                                <CheckDefaultParentPack
                                    children={<NewChat />}
                                />
                            }
                        />

                        <Route
                            path="asks/new"
                            element={
                                <CheckDefaultParentPack children={<NewAsk />} />
                            }
                        />

                        <Route path="calendar">
                            <Route path="month" element={<MonthCalendar />} />
                            <Route path="day" element={<DayCalendar />} />
                        </Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}
