import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extract_user_id } from "../../api_dist/api/utils";
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext";
import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
export const Login = () => {
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    var { strings } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    var [login_mode, set_login_mode] = useState() // verf_code_mode or password_mode
    async function login() {
        var input_value = document.getElementById("value_input").value
        if (!input_value) {
            alert(strings[30])
            return
        }
        try {
            var { jwt } = (
                await window.uhc.configured_axios({
                    url: "login",
                    data: {
                        value: input_value,
                        login_mode,
                        identifier:
                            document.getElementById("identifier_input").value,
                    },
                    method: "post",
                })
            ).data
            alert(strings[7])
            var user_id = extract_user_id(jwt)
            if (
                !profiles_seed.map((p_seed) => p_seed.user_id).includes(user_id)
            ) {
                set_virtual_local_storage((prev) => ({
                    ...prev,
                    profiles_seed: [
                        ...prev.profiles_seed.map((i) => ({
                            ...i,
                            is_active: false,
                        })),
                        { user_id, jwt, is_active: true },
                    ],
                }))
            }
            nav("/dashboard")
        } catch (error) {
            console.log(error)
            alert(strings[31])
        }
    }
    async function send_verification_code() {
        var identifier = document.getElementById("identifier").value
        if (!identifier) {
            alert(strings[32])
            return
        }
        await window.uhc.configured_axios({
            url: "/send_verification_code",
            data: {
                identifier,
            },
            method: "post",
        })
    }
    async function go_step_2(login_mode) {
        try {
            if (login_mode === "verf_code_mode") {
                await send_verification_code()
            }
            set_login_mode(login_mode)
        } catch (error) {
            alert(strings[33])
        }
    }
    return (
        <div className="flex flex-col justify-center items-center p-4 w-1/2 mx-auto">
            <h1 className="text-4xl mb-2">{strings[34]}</h1>
            <div className="text-center">{strings[35]}</div>
            <ul>
                <li>{strings[36]}</li>
                <li>{strings[37]}</li>
                <li>{strings[38]}</li>
                <li>{strings[39]}</li>
            </ul>

            <input
                className="border border-blue-400 w-full rounded mt-5"
                id="identifier_input"
                disabled={login_mode !== undefined}
            />
            <br />
            {login_mode === undefined ? (
                <div className="flex flex-col justify-center items-center">
                    <br />
                    <StyledDiv
                        className="border border-blue-500 w-full text-center"
                        onClick={() => go_step_2("verf_code_mode")}
                    >
                        {strings[40]}
                    </StyledDiv>

                    <StyledDiv
                        className="border border-blue-500 w-full mt-2 text-center"
                        onClick={() => go_step_2("password_mode")}
                    >
                        {strings[41]}
                    </StyledDiv>
                </div>
            ) : (
                <>
                    <b>{login_mode === "verf_code_mode" && strings[42]}</b>
                    <p>{login_mode === "password_mode" && strings[43]}</p>
                    <input
                        className="border border-blue-400"
                        id="value_input"
                    />
                    <br />{" "}
                    <StyledDiv
                        className="border border-blue-500 w-fit"
                        onClick={login}
                    >
                        {strings[34]}{" "}
                    </StyledDiv>
                </>
            )}
        </div>
    )
}
