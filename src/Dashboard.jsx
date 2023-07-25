import React, { useContext, useState } from "react"
import "./App.css"
import "./output.css"
import { useNavigate } from "react-router-dom"
import "react-contexify/ReactContexify.css"
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext"
import { Calendar } from "primereact/calendar"
import { InputSwitch } from "primereact/inputswitch"
import {
    CustomTabMenu,
    Feed,
    NewUnitShortcuts,
    MetroButton,
} from "./components/DashboardParts"
import { ProfilesSlideMenu } from "./components/DashboardParts"
import { Button } from "primereact/button"
import { Panel } from "primereact/panel"
import { InputNumber } from "primereact/inputnumber"

export function Dashboard() {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var [date, setDate] = useState()
    var { strings } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    return (
        <>
            <h1 className="md:hidden">a larger screen is required.</h1>
            <div className="h-full w-full border-black-900 flex-col hidden md:grid p-4">
                <div
                    className="grid grid-cols-2 gap-4 grid-rows-2"
                    style={{
                        gridTemplateColumns: "270px 1fr",
                        gridTemplateRows: "210px 1fr",
                    }}
                >
                    <div className="col-start-1 row-start-1 row-end-2 col-end-2">
                        <ProfilesSlideMenu />
                    </div>
                    <div
                        style={{ gridArea: "2 / 1 / 3 / 1" }}
                        className="rounded flex flex-col space-y-2"
                    >
                        <MetroButton
                            className={"w-full"}
                            bi={"bi-person-lines-fill"}
                            text="My Active Profile"
                            link={`/${uhc.user_id}`}
                        />

                        <Panel
                            className="h-full"
                            header={
                                <div className="flex space-x-2">
                                    <i
                                        className={`bi-clock-history font-bold`}
                                    />
                                    <span>Sync Centre</span>
                                </div>
                            }
                        >
                            <p>
                                you have access to ${cache.length} things over
                                the network. some of them may have hundereds or
                                thousands of changes from their beginning. "max
                                depth" is maximum number of changes you want to
                                fetch for each thing. minimum is 1 which means
                                you just want to be synced with latest change of
                                those things.
                            </p>

                            <label
                                htmlFor="max_sync_depth_undefined"
                                className="font-bold block mb-2"
                            >
                                sync without limit
                            </label>

                            <InputSwitch
                                inputId="max_sync_depth_undefined"
                                checked={uhc.max_sync_depth === undefined}
                                onChange={(e) =>
                                    (uhc.max_sync_depth =
                                        e.value === true ? undefined : 10)
                                }
                            />

                            <label
                                htmlFor="max_depth"
                                className="font-bold block mb-2"
                            >
                                Max Sync Depth
                            </label>
                            <InputNumber
                                min={1}
                                inputId="max_depth"
                                value={uhc.max_sync_depth}
                                onValueChange={(e) =>
                                    (uhc.max_sync_depth = e.value)
                                }
                            />
                        </Panel>
                    </div>
                    <div className="col-span-full col-start-2 row-start-1 row-span-full">
                        <Feed />
                    </div>
                </div>
                <Panel
                    header={"New Unit"}
                    className="my-4"
                >
                    <div className="grid grid-rows-1 grid-cols-4 justify-around gap-x-2">
                        <Button
                            severity="info"
                            icon={<i className="bi-box-fill pr-2"></i>}
                        >
                            New Pack
                        </Button>
                        <Button
                            severity="info"
                            icon={<i className="bi-cloud-upload-fill pr-2"></i>}
                        >
                            New Resource
                        </Button>
                        <Button
                            severity="info"
                            icon={<i className="bi-card-text pr-2"></i>}
                        >
                            New Writing
                        </Button>
                        <Button
                            severity="info"
                            icon={
                                <i className="bi-patch-question-fill pr-2"></i>
                            }
                        >
                            New Ask
                        </Button>
                    </div>
                </Panel>
                <NewUnitShortcuts />
                <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="col-start-1 col-span-1 row-span-full grid grid-cols-1 gap-y-4 items-around">
                        <Panel
                            header={
                                <>
                                    <i className="bi-person-fill-gear pr-3" />
                                    <span>Settings shortcuts</span>
                                </>
                            }
                        >
                            <div className="flex flex-col space-y-2">
                                {[
                                    {
                                        text: "profile picture ",
                                        url: "/settings#profile_picture",
                                        bi: "bi-image",
                                    },
                                    {
                                        text: "export complete backup ",
                                        url: "/settings#export_backup",
                                        bi: "bi-file-zip",
                                    },
                                    {
                                        text: "change email",
                                        url: "/settings#change_credentials",
                                        bi: "bi-envelope-at",
                                    },
                                    {
                                        text: "change password ",
                                        url: "/settings#change_credentials",
                                        bi: "bi-shield-lock",
                                    },
                                    {
                                        text: "change full name ",
                                        url: "/settings#change_credentials",
                                        bi: "bi-pen",
                                    },
                                    {
                                        text: "change language ",
                                        url: "/settings#change_language",
                                        bi: "bi-translate",
                                    },
                                    {
                                        text: "change calendar and first day of week",
                                        url: "/settings#calendar_related",
                                        bi: "bi-calendar4",
                                    },
                                    {
                                        text: "open settings",
                                        url: "/settings",
                                        bi: "bi-gear",
                                    },
                                ].map(({ text, url, bi }, index) => (
                                    <Button
                                        outlined
                                        size="small"
                                        onClick={() => nav(url)}
                                        key={index}
                                    >
                                        <i className={`${bi} mr-2`} /> {text}
                                    </Button>
                                ))}
                            </div>
                        </Panel>

                        <MetroButton
                            bi={""}
                            text={"Go Premium"}
                            link={"/subscription"}
                        />
                    </div>
                    <div className="col-span-2 col-start-2 row-span-full">
                        <Calendar
                            className="w-full"
                            value={date}
                            onChange={(e) => setDate(e.value)}
                            inline
                            showWeek
                        />
                    </div>
                </div>
                <CustomTabMenu />
            </div>
        </>
    )
}
