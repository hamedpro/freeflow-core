import React from "react"
import {
    Feed,
    MetroButton,
    ProfilesSlideMenu,
    SyncCentreWidget,
    TimeTravel,
} from "./DashboardParts"
import { CustomNavBar } from "./CustomNavBar"

export const Profiles = () => {
    return (
        <div>
            <CustomNavBar
                main_text={
                    "Profiles: manage your profiles and their max sync depths. you can also travel in time and more!"
                }
                back_link={"/"}
                back_text={"Dashboard"}
            />
            <div className="h-full w-full border-black-900 flex-col grid py-4">
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
                        <MetroButton
                            className={"w-full"}
                            bi={"bi-rocket-takeoff"}
                            text={"Go Premium"}
                            link={"/subscription"}
                        />
                    </div>

                    <div className="col-span-full col-start-2 row-start-1 row-span-full">
                        <SyncCentreWidget />
                    </div>
                </div>
            </div>

            <TimeTravel />
        </div>
    )
}
