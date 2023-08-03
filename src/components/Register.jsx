import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { extract_user_id } from "../../api_dist/api/utils"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Checkbox } from "primereact/checkbox"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import validator from "validator"
import { AxiosError } from "axios"
export var Register = () => {
    var [verf_code_status, set_verf_code_status] = useState() // progress , sent , failed
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    var { strings, cache } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()
    const [verf_code, set_verf_code] = useState()
    const [checked, setChecked] = useState(false)
    const [email, set_email] = useState()
    async function create_new_account() {
        try {
            var { jwt } = (
                await window.uhc.configured_axios({
                    url: "/register",
                    data: {
                        email_address: email,
                        verf_code,
                        ...(checked
                            ? { exp_duration: 7 * 3600 * 24 }
                            : undefined), // in seconds
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
                        { user_id, jwt, is_active: true, max_sync_depth: 3 },
                    ],
                }))
            }
            nav("/")
        } catch (error) {
            if (error instanceof AxiosError && error.response.status === 403) {
                alert(strings[31])
            } else {
                console.log(error)
                alert(strings[8])
            }
        }
    }
    async function send_verification_code() {
        return window.uhc.configured_axios({
            url: "/send_verification_code",
            data: {
                email_address: email,
            },
            method: "post",
        })
    }
    var email_is_used =
        cache.find(
            (ci) =>
                ci.thing.type === "user" &&
                ci.thing.value.email_address === email
        ) !== undefined

    var email_is_invalid = email && !validator.isEmail(email)

    var submit_must_be_disabled =
        !email || !verf_code || email_is_used || email_is_invalid

    useEffect(() => {
        if (email && !email_is_used && !email_is_invalid) {
            set_verf_code_status("progress")
            send_verification_code().then(
                () => {
                    set_verf_code_status("sent")
                },
                () => {
                    set_verf_code_status("failed")
                }
            )
        }
    }, [email])
    return (
        <div
            className={
                "flex items-center justify-center overflow-hidden h-full w-full"
            }
        >
            <div className="flex flex-col items-center justify-center">
                <div
                    style={{
                        borderRadius: "56px",
                        padding: "0.3rem",
                    }}
                    className="bg-blue-100"
                >
                    <div
                        className="w-full surface-card py-8 px-5 sm:px-8"
                        style={{ borderRadius: "53px" }}
                    >
                        <div className="text-center mb-5 flex flex-col items-center">
                            <div className="mb-3 h-24 w-24 rounded-2xl border border-blue-200 overflow-hidden flex items-center justify-center">
                                <i className="bi-person-fill  text-6xl" />
                            </div>

                            <div className="text-900 text-3xl font-medium mb-3">
                                Welcome !
                            </div>
                            <span className="text-600 font-medium">
                                Sign up to continue
                            </span>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-900 text-xl font-medium mb-2"
                            >
                                Email Address{" "}
                            </label>

                            <InputText
                                inputid="email"
                                type="text"
                                placeholder="Type it here"
                                className={`w-full md:w-30rem ${
                                    email === "" && "p-invalid"
                                } `}
                                style={{ padding: "1rem" }}
                                onChange={(e) => set_email(e.target.value)}
                            />
                            {email_is_used && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    this email is already used.
                                </span>
                            )}
                            {email === "" && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    Error. email can not be empty
                                </span>
                            )}
                            {email_is_invalid && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    Error. email format is incorrect.
                                </span>
                            )}

                            <label
                                htmlFor="verf_code"
                                className="block text-900 text-xl font-medium mb-2 mt-5"
                            >
                                Verification Code
                            </label>

                            <InputText
                                inputid="verf_code"
                                type="text"
                                placeholder="we send code automatically."
                                className={`w-full md:w-30rem${
                                    email === "" && "p-invalid"
                                } `}
                                style={{ padding: "1rem" }}
                                onChange={(e) => set_verf_code(e.target.value)}
                            />
                            {email && !email_is_used && !email_is_invalid && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    {verf_code_status === "failed" &&
                                        "Error. could not send verification codes."}
                                    {verf_code_status === "sent" &&
                                        `verification code is sent.`}
                                    {verf_code_status === "progress" &&
                                        "sending verification code ..."}
                                </span>
                            )}
                            {verf_code === "" && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    Error. verf code can not be empty
                                </span>
                            )}
                            <div className="flex align-items-center justify-content-between mb-5 gap-5 mt-5">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputid="rememberme1"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked)}
                                        className="mr-2"
                                    ></Checkbox>
                                    <label htmlFor="rememberme1">
                                        Expire Login in 7 days
                                    </label>
                                </div>
                                <button
                                    onClick={() => nav("/login")}
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: "var(--primary-color)" }}
                                >
                                    Already have an account?
                                </button>
                            </div>
                            <Button
                                disabled={submit_must_be_disabled}
                                label="Sign Up"
                                className="w-full p-3 text-xl"
                                onClick={create_new_account}
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
