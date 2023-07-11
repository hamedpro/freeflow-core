import React, { useContext, useEffect, useState } from "react";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { useNavigate } from "react-router-dom";
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext";
import { extract_user_id } from "../../api_dist/api/utils";
import validator from "validator";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
export const Register = () => {
	var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )


    var nav = useNavigate()
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var [username_input_value, set_username_input_value] = useState("")
    var [password_input_value, set_password_input_value] = useState("")
    async function create_new_account() {
        if (!Object.values(validations).every((i) => i === true)) {
            alert(strings[5])
            return
        }
        if (!username_input_value || !password_input_value) {
            alert(strings[6])
            return
        }
        try {
            var { jwt } = (
                await window.uhc.configured_axios({
                    url: "/register",
                    data: {
                        username: username_input_value,
                        password: password_input_value,
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
            alert(strings[8])
        }
    }
    var validations = {
        username_is_available:
            cache
                .filter((i) => i.thing.type === "user")
                .map((i) => i.thing.value.username)
                .includes(username_input_value) !== true,
        password_is_strong: validator.isStrongPassword(password_input_value),
        username_is_valid: validator.isAlphanumeric(username_input_value),
    }

    return (
        <div className="p-4">
            <h1>{strings[9]}</h1>
            <h1>{strings[10]}</h1>
            <input
                id="username_input"
                value={username_input_value}
                className="border border-blue-400 px-2"
                onChange={(e) => set_username_input_value(e.target.value)}
            />
            {!validations.username_is_available && <p>{strings[11]}</p>}
            <h1>{strings[12]}</h1>
            <input
                id="password_input"
                value={password_input_value}
                className="border border-blue-400 px-2"
                onChange={(e) => set_password_input_value(e.target.value)}
            />
            <Section title={strings[13]}>
                <Section title={strings[14]}>
                    <div>
                        <h3 className="text-2xl">{strings[15]}</h3>
                        <ul>
                            <li>{strings[16]}</li>
                        </ul>
                    </div>
                    <hr />
                    <div>
                        <h3 className="text-2xl">{strings[17]}</h3>
                        <ul>
                            <li>{strings[18]}</li>
                            <li>{strings[19]}</li>
                            <li>{strings[20]}</li>
                            <li>{strings[21]}</li>
                            <li>{strings[22]}</li>
                        </ul>
                    </div>
                </Section>
                <Section title={strings[23]}>
                    <div>
                        <span>
                            [
                            {validations.password_is_strong
                                ? strings[25]
                                : strings[24]}
                            ] : {strings[26]}{" "}
                        </span>
                    </div>
                    <div>
                        <span>
                            [
                            {validations.username_is_available
                                ? strings[25]
                                : strings[24]}
                            ] : {strings[27]}{" "}
                        </span>
                    </div>
                    <div>
                        <span>
                            [
                            {validations.username_is_valid
                                ? strings[25]
                                : strings[24]}
                            ] : {strings[28]}{" "}
                        </span>
                    </div>
                </Section>
            </Section>
            <StyledDiv
                onClick={create_new_account}
                className="w-fit "
                disabled={!Object.values(validations).every((i) => i === true)}
            >
                {strings[29]}{" "}
            </StyledDiv>
        </div>
    )
};
