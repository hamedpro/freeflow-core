import React from "react"
import "./output.css"
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css"

//core
import "primereact/resources/primereact.min.css"

import "./App.css"

import "bootstrap-icons/font/bootstrap-icons.css"
import "react-dropdown/style.css"
import { BrowserRouter } from "react-router-dom"
import "react-contexify/ReactContexify.css"
import { Dashboard } from "./components/Dashboard"
import { UnifiedHandlerClientContextProvider } from "./UnifiedHandlerClientContextProvider"
import { VirtualLocalStorageContextProvider } from "./VirtualLocalStorageContextProvider"
import { TimeTravelWarning } from "./components/TimeTravelWarning"

function App() {
    return (
        <VirtualLocalStorageContextProvider>
            <UnifiedHandlerClientContextProvider>
                <TimeTravelWarning />
                <BrowserRouter>
                    <Dashboard />
                </BrowserRouter>
            </UnifiedHandlerClientContextProvider>
        </VirtualLocalStorageContextProvider>
    )
}

export default App
