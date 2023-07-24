import React, { useContext, useState } from "react"
import { processes_context } from "../processes_context"
import { Chart } from "primereact/chart"
export const Processes = ({ children }) => {
    var [processes, set_processes] = useState([])

    return (
        <processes_context.Provider value={{ set_processes, prop: 1 }}>
            <div className="z-50 fixed w-full h-full bg-blue-500"></div>

            {children}
        </processes_context.Provider>
    )
}
