import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { extract_user_id } from "../../api_dist/api/utils"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Checkbox } from "primereact/checkbox"
import { Button } from "primereact/button"
import { Password } from "primereact/password"
import { InputText } from "primereact/inputtext"
import { flexible_user_finder } from "../../api_dist/api/utils"
var Login = () => {
    const [verf_code_or_password, set_verf_code_or_password] = useState()
    const [checked, setChecked] = useState(false)
    const [identifier, set_identifier] = useState("")
    const [verf_code_status, set_verf_code_status] = useState() // sent or failed or progress
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    var { strings, cache } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()

    async function login() {
        try {
            var { jwt } = (
                await window.uhc.configured_axios({
                    url: "login",
                    data: {
                        value: verf_code_or_password,
                        identifier,
                        ...(checked
                            ? { exp_duration /* seconds */: 7 * 3600 * 24 }
                            : undefined),
                    },
                    method: "post",
                })
            ).data
            alert(strings[7])
            var user_id = extract_user_id(jwt)

            // if this user is logged in before we delete its former profile seed
            set_virtual_local_storage((prev) => ({
                ...prev,
                profiles_seed: prev.profiles_seed.filter(
                    (ps) => ps.user_id !== user_id
                ),
            }))

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
            nav("/")
        } catch (error) {
            console.log(error)
            alert(strings[31])
        }
    }

    var matching_user_id = flexible_user_finder(cache, identifier)
    var matching_user =
        matching_user_id &&
        cache.find((cache_item) => cache_item.thing_id === matching_user_id)
    async function send_verification_code() {
        return window.uhc.configured_axios({
            url: "/send_verification_code",
            data: {
                email_address: matching_user.thing.value.email_address,
            },
            method: "post",
        })
    }
    useEffect(() => {
        if (matching_user) {
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
    }, [matching_user_id])
    var no_matching_user = identifier !== "" && matching_user === undefined
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
                                {matching_user &&
                                matching_user.thing.value
                                    .profile_image_file_id ? (
                                    <img
                                        src={
                                            new URL(
                                                `/files/${
                                                    matching_user.thing.value
                                                        .profile_image_file_id
                                                }?${
                                                    uhc.jwt && "jwt=" + uhc.jwt
                                                }`,
                                                window.RESTFUL_API_ENDPOINT
                                            ).href
                                        }
                                        alt="Image"
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <i className="bi-person-fill  text-6xl" />
                                )}
                            </div>

                            <div className="text-900 text-3xl font-medium mb-3">
                                Welcome{" "}
                                {matching_user &&
                                    (matching_user.thing.value.full_name ||
                                        matching_user.thing.value
                                            .email_address)}
                                !
                            </div>
                            <span className="text-600 font-medium">
                                Sign in to continue
                            </span>
                        </div>

                        <div>
                            <label
                                htmlFor="identifier"
                                className="block text-900 text-xl font-medium mb-2"
                            >
                                Email or User id{" "}
                            </label>

                            <InputText
                                inputid="identifier"
                                type="text"
                                placeholder="your user id or email"
                                className={`w-full md:w-30rem ${
                                    no_matching_user && "p-invalid"
                                } `}
                                style={{ padding: "1rem" }}
                                onChange={(e) => set_identifier(e.target.value)}
                            />
                            {no_matching_user && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    there is not any matching user
                                </span>
                            )}
                            <label
                                htmlFor="verf_code_or_password"
                                className="block text-900 font-medium text-xl mb-2 mt-5"
                            >
                                Password or verification code
                            </label>
                            <Password
                                inputid="verf_code_or_password"
                                feedback={false}
                                onChange={(e) =>
                                    set_verf_code_or_password(e.target.value)
                                }
                                placeholder="we send verf code automatically"
                                toggleMask
                                className="w-full"
                                inputClassName="w-full p-3 md:w-30rem"
                            ></Password>
                            {!no_matching_user && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    {verf_code_status === "failed" &&
                                        "Error. could not send verification codes."}
                                    {verf_code_status === "sent" &&
                                        `verification code is sent.`}
                                    {verf_code_status === "progress" &&
                                        "sending verification code ..."}
                                </span>
                            )}
                            {verf_code_or_password === "" && (
                                <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                                    Error. password can not be empty
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
                                    onClick={() => {
                                        nav("/forget-password")
                                    }}
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: "var(--primary-color)" }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <Button
                                disabled={no_matching_user}
                                label="Sign In"
                                className="w-full p-3 text-xl"
                                onClick={login}
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export { Login }
