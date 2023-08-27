import React from "react"
import { useNavigate } from "react-router-dom"

export const CustomNavBar = ({ main_text, back_text, back_link }) => {
    var nav = useNavigate()
    return (
        <div className="flex justify-between items-center mb-6 space-x-6">
            <div
                onClick={() => nav(back_link)}
                className="hover:bg-gray-200 duration-300 rounded cursor-pointer flex flex-nowrap text-lg hover:px-2"
            >
                <i className="bi-caret-left-fill" /> {back_text}
            </div>

            <h1 className="text-lg border-0 border-gray-200 rounded px-2">
                {main_text}
            </h1>
            <span></span>
        </div>
    )
}
