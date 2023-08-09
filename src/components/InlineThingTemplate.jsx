import React from "react"
export const InlineThingTemplate = ({ children, ...props }) => {
    return (
        <div
            className={`grid grid-flow-col auto-cols-auto
            bg-white rounded shadow p-4 border-white
            hover:border-blue-500 border duration-300
            cursor-pointer`}
            {...props}
        >
            {children}
        </div>
    )
}
