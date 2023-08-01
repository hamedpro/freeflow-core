import React from "react"
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css"

//core
import "primereact/resources/primereact.min.css"

import "./App.css"
import "./output.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "react-dropdown/style.css"
import { Routes, Route, BrowserRouter } from "react-router-dom"
import { SubscribtionPage } from "./components/subscribtionPage"
import { Terms } from "./components/Terms"
import { Register } from "./components/Register"
import "react-contexify/ReactContexify.css"
import { Dashboard } from "./Dashboard"
import { UnifiedHandlerClientContextProvider } from "./UnifiedHandlerClientContextProvider"
import { Login } from "./components/Login"
import { VirtualLocalStorageContextProvider } from "./VirtualLocalStorageContextProvider"
import { UserSettings } from "./components/UserSettings"
import { Stage } from "./components/Stage"
import { Feed } from "./components/Feed"
import { WhatsHappening } from "./components/WhatsHappening"
import { Units } from "./components/Units"
import { ForgetPassword } from "./components/ForgetPassword"
import { TimeTravelWarning } from "./components/TimeTravelWarning"

function App() {
    return (
        <VirtualLocalStorageContextProvider>
            <UnifiedHandlerClientContextProvider>
                <TimeTravelWarning />
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
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
                            path="settings"
                            element={<UserSettings />}
                        />

                        <Route
                            path="feed"
                            element={<Feed />}
                        />
                        <Route
                            path="whats-happening"
                            element={<WhatsHappening />}
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
                </BrowserRouter>
            </UnifiedHandlerClientContextProvider>
        </VirtualLocalStorageContextProvider>
    )
}

export default App
