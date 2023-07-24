import React, { useContext, useEffect, useState } from "react"
import "./App.css"
import "./output.css"
import { useNavigate } from "react-router-dom"
import "react-contexify/ReactContexify.css"
import { VirtualLocalStorageContext } from "./VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { NewUnitShortcuts } from "./components/NewUnitShortcuts"
import { ProfilesSlideMenu } from "./components/ProfilesSlideMenu"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Panel } from "primereact/panel"
import { useNewProcess } from "./useNewProcess"
import { processes_context } from "./processes_context"

function MetroButton({ bi, text, link }) {
    var nav = useNavigate()
    return (
        <Button
            size="large"
            onClick={() => nav(link)}
            severity="info"
            icon={<i className={`text-3xl ${bi} px-3`} />}
        >
            <span>{text}</span>
        </Button>
    )
}
export function Dashboard() {
    var [date, setDate] = useState()
    var { strings } = useContext(UnifiedHandlerClientContext)

    var new_process = useNewProcess()
    async function do_a_long_task() {
        new_process(
            "going to wait for 5 seconds",
            async () =>
                new Promise((resolve) => {
                    setTimeout(() => {
                        resolve()
                    }, 5000)
                })
        )
    }
    useEffect(() => {
        do_a_long_task()
    }, [])

    return (
        <>
            <h1 className="md:hidden">a larger screen is required.</h1>
            <div className="h-full w-full border-black-900 flex-col hidden md:grid p-4">
                <div
                    className="grid grid-cols-3 grid-rows-2 gap-4"
                    style={{ height: "500px" }}
                >
                    <div className="col-end-2 col-start-1 row-end-2 row-start-1">
                        <ProfilesSlideMenu />
                    </div>
                    <div className="col-start-2 col-span-1 row-span-full grid grid-cols-1 gap-y-4 items-around">
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
                            bi={""}
                            text={"Go Premium"}
                            link={"/subscription"}
                        />
                    </div>
                    <div className="col-span-1 col-start-3 row-span-full">
                        <Calendar
                            value={date}
                            onChange={(e) => setDate(e.value)}
                            inline
                            showWeek
                        />
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
            </div>
        </>
    )
}
