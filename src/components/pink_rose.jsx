import { CheckBox } from "@mui/icons-material";
import { useState } from "react";
function Login1() {
    return (
        <><h1 className="p-0 mt-0" style={{ fontSize: "70px" }}>login</h1><p className="  text-lg text-stone-400">enter your email address or phone number down below: </p><input id="input_1" className="mt-4 mb-2 text-2xl border border-stone-400 rounded" /><span className="mt-1 block">
            <CheckBox /> keep me loged in
        </span><button
            className="absolute block mt-4 bg-blue-500 text-white px-2 py-1 rounded text-2xl "
            style={{ left: "50%", transform: "translate(-50%,0%)", width: "200px", bottom: "10%" }}
        >
                submit
            </button></>
    )
}

function Login2() {
    var [mode,set_mode] = useState('sms')
    return (
        <>
            {mode === "sms" && (
                <>
                    <h1 className="text-2xl" style={{fontSize : "60px"}}>
                        continue auth
                    </h1>
                    <p className="text-stone-400 text-lg mt-4">
                        enter verification code sent to you
                    </p>
                </>
            )}
        </>
    )
}
export function Login() {
    var [active_page, set_active_page] = useState(1)
    return (
        <>
            <div className="h-full w-full flex flex-row">
            <div className="w-1/2 h-full bg-blue-400"></div>
            <div className="w-1/2 h-full p-5 relative" style={{
                paddingTop: "10%",
                paddingBottom: "10%",
                paddingLeft: '40px',
                paddingRight : "40px"
            }}>
                    {active_page === 1 && <Login1 />}
                    {active_page === 2 && <Login2 />}
            </div>
        </div>
        </>
    )
}