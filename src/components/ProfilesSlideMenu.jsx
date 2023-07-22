import React, { useContext } from "react"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { SlideMenu } from "primereact/slidemenu"
import { useNavigate } from "react-router-dom"

export const ProfilesSlideMenu = () => {
    var nav = useNavigate()
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    function select_profile(new_user_id) {
        set_virtual_local_storage((prev) => ({
            ...prev,
            profiles_seed: prev.profiles_seed.map((seed) => ({
                ...seed,
                is_active: seed.user_id === new_user_id,
            })),
        }))
    }
    var profiles_items = profiles_seed.map((profile) => {
        var label = `${strings[46]} #${profile.user_id}`
        if (profile.user_id === 0) {
            label = strings[47]
        } else if (profile.user_id === -1) {
            label = strings[48]
        } else {
            var t = cache.find(
                (cache_item) => cache_item.thing_id === profile.user_id
            )
            if (t !== undefined) {
                label = t.thing.value.email_address || t.thing.value.full_name
            }
        }
        return {
            label,
            command: () => {
                select_profile(profile.user_id)
            },
            active: profile.is_active,
            code: profile.user_id,
            icon: icon(profile.user_id),
        }
    })
    var model = [
        {
            items: profiles_items,
            ...profiles_items.find((i) => i.active),
            ...{ command: undefined },
        },
        { label: "Add existing account", command: () => nav("/login") },
        { label: "Register an account", command: () => nav("/register") },
        { separator: true },

        {
            label: "Logout",
            command: () => {
                select_profile(0)
            },
        },
    ]

    function icon(code) {
        var profile_image_file_id = cache.find(
            (cache_item) => cache_item.thing_id === code
        )?.thing.value?.profile_image_file_id

        return (
            <>
                {code === -1 && <i className="bi-person-fill pr-2"> </i>}
                {code === 0 && <i className="bi-people pr-2"> </i>}
                {code > 0 &&
                    (profile_image_file_id ? (
                        <img
                            src={
                                new URL(
                                    `/files/${profile_image_file_id}?${
                                        uhc.jwt && "jwt=" + uhc.jwt
                                    }`,
                                    window.RESTFUL_API_ENDPOINT
                                ).href
                            }
                            style={{
                                width: "25px",
                                height: "25px",
                                borderRadius: "100%",
                            }}
                        />
                    ) : (
                        <i className="bi-person pr-2"></i>
                    ))}
            </>
        )
    }
    return (
        <SlideMenu
            model={model}
            viewportHeight={210}
            menuWidth={300}
            style={{ width: "300px", height: "210px" }}
        ></SlideMenu>
    )
}
