import React from "react"
import { Route, Routes } from "react-router-dom"
import "react-contexify/ReactContexify.css"
import { Feed, Saved } from "./DashboardParts"
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
import { Finder } from "./Finder"

export function Dashboard() {
    return (
        <div
            className="flex"
            style={{ height: "100vh", width: "100vw" }}
        >
            <div className="h-full w-fit">
                <DashboardSideBar />
            </div>
            <div className="w-full h-full overflow-y-auto">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="p-6">
                                <Finder />
                            </div>
                        }
                    />
                    <Route
                        path="/finder"
                        element={
                            <div className="p-6">
                                <Finder />
                            </div>
                        }
                    />
                    <Route
                        path="/whats-happening"
                        element={
                            <div className="p-6">
                                <WhatsHappening />
                            </div>
                        }
                    />

                    <Route
                        path="/new-unit"
                        element={
                            <div className="p-6">
                                <DashboardNewUnit />
                            </div>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <div className="p-6">
                                <Register />
                            </div>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <div className="p-6">
                                <Login />
                            </div>
                        }
                    />
                    <Route
                        path="/terms"
                        element={
                            <div className="p-6">
                                <Terms />
                            </div>
                        }
                    />
                    <Route
                        path="/feed"
                        element={
                            <div className="p-6">
                                <Feed />
                            </div>
                        }
                    />
                    <Route
                        path="/subscription"
                        element={
                            <div className="p-6">
                                <SubscribtionPage />
                            </div>
                        }
                    />

                    <Route
                        path="/preferences"
                        element={
                            <div className="p-6">
                                <UserSettings />
                            </div>
                        }
                    />

                    <Route
                        path="units"
                        element={
                            <div className="p-6">
                                <Units />
                            </div>
                        }
                    />
                    <Route
                        path="forget-password"
                        element={
                            <div className="p-6">
                                <ForgetPassword />
                            </div>
                        }
                    />

                    <Route
                        path="/:thing_id/*"
                        element={<Stage />}
                    />
                </Routes>
            </div>
        </div>
    )
}
