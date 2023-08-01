import React, { useContext, useState } from "react"
import "../App.css"
import "../output.css"
import { Route, Routes, useNavigate } from "react-router-dom"
import "react-contexify/ReactContexify.css"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Calendar } from "primereact/calendar"
import {
    Feed,
    NewUnitShortcuts,
    MetroButton,
    SyncCentreWidget,
    TimeTravel,
    Saved,
} from "./DashboardParts"
import { ProfilesSlideMenu } from "./DashboardParts"
import { Button } from "primereact/button"
import { Panel } from "primereact/panel"
import { DashboardSideBar } from "./DashboardSideBar"
import { Units } from "./Units"
import { ForgetPassword } from "./ForgetPassword"
import { Stage } from "./Stage"
import { SubscribtionPage } from "./subscribtionPage"
import { Terms } from "./Terms"
import { Login } from "./Login"
import { Register } from "./Register"
import { UserSettings } from "./UserSettings"
import { WhatsHappening } from "./WhatsHappening"
import { DashboardNewUnit } from "./DashboardNewUnit"
import { Profiles } from "./Profiles"

export function Dashboard() {
    return (
        <div
            className="flex"
            style={{ height: "100vh", width: "100vw" }}
        >
            <div className="h-full w-fit">
                <DashboardSideBar />
            </div>
            <div className="w-full p-6 h-full overflow-y-auto">
                <Routes>
                    <Route
                        path="/feed"
                        element={<Feed />}
                    />

                    <Route
                        path="/"
                        element={<Feed />}
                    />
                    <Route
                        path="/saved"
                        element={<Saved />}
                    />
                    <Route
                        path="/whats-happening"
                        element={<WhatsHappening />}
                    />
                    <Route
                        path="/profiles"
                        element={<Profiles />}
                    />
                    <Route
                        path="/new-unit"
                        element={<DashboardNewUnit />}
                    />
                    <Route
                        path="/register"
                        element={<Register />}
                    />
                    <Route
                        path="/login"
                        element={<Login />}
                    />
                    <Route
                        path="/terms"
                        element={<Terms />}
                    />
                    <Route
                        path="/subscription"
                        element={<SubscribtionPage />}
                    />

                    <Route
                        path="/preferences"
                        element={<UserSettings />}
                    />

                    <Route
                        path="units"
                        element={<Units />}
                    />
                    <Route
                        path="forget-password"
                        element={<ForgetPassword />}
                    />

                    <Route
                        path="/:thing_id/*"
                        element={<Stage />}
                    />
                </Routes>
            </div>
        </div>
    )
    return <></>
}
