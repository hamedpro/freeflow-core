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
import { Root } from "./components/Root.jsx"
import UserProfile from "./components/UserProfile"
import { Register } from "./components/Register"
import "react-contexify/ReactContexify.css"
import { Dashboard } from "./Dashboard"
import { UnifiedHandlerClientContextProvider } from "./UnifiedHandlerClientContextProvider"
import { Login } from "./components/Login"
import { VirtualLocalStorageContextProvider } from "./VirtualLocalStorageContextProvider"

function App() {
    return (
        <VirtualLocalStorageContextProvider>
            <UnifiedHandlerClientContextProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Root />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route
                            path="/subscribtion"
                            element={<SubscribtionPage />}
                        />
                        <Route
                            path="/dashboard/*"
                            element={<Dashboard />}
                        ></Route>
                    </Routes>
                </BrowserRouter>
            </UnifiedHandlerClientContextProvider>
        </VirtualLocalStorageContextProvider>
    )
}

export default App
