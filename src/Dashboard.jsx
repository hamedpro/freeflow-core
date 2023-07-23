import React, { useContext, useState } from "react"
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
    var nav = useNavigate()
    return (
        <>
            <h1 className="md:hidden">a larger screen is required.</h1>
            <div className="h-full w-full border-black-900 flex-col hidden md:grid">
                <div
                    className="grid grid-cols-3 grid-rows-2 gap-4 p-4"
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

                <NewUnitShortcuts />
            </div>
        </>
    )
}
