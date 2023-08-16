import React, { useContext } from "react"
import { Avatar } from "primereact/avatar"
import { AvatarGroup } from "primereact/avatargroup"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { custom_find_unique } from "../../api_dist/common_helpers"
export const CustomAvatarGroup = ({ thing_id }) => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var collaboarators = custom_find_unique(
        uhc.transactions
            .filter((trans) => trans.thing_id === thing_id)
            .map((trans) => trans.user_id),
        (user_id1, user_id2) => user_id1 === user_id2
    )
    return (
        <div>
            <label className="text-xl">
                {/*  <i className="bi-people mr-1" /> */}
                Collaboarators
            </label>
            <AvatarGroup className="mt-2">
                {collaboarators
                    .slice(0, 5)
                    .map((user_id) =>
                        cache.find((ci) => ci.thing_id === user_id)
                    )
                    .map((ci) => {
                        var image = ci.thing.value.profile_image_file_id
                            ? new URL(
                                  `/files/${
                                      ci.thing.value.profile_image_file_id
                                  }?${uhc.jwt && "jwt=" + uhc.jwt}`,
                                  window.RESTFUL_API_ENDPOINT
                              ).href
                            : undefined
                        image = undefined
                        return (
                            <Avatar
                                key={ci.thing_id}
                                size="normal"
                                shape="circle"
                            >
                                {image ? (
                                    <img src={image} />
                                ) : (
                                    <i className="bi-person-heart" />
                                )}
                            </Avatar>
                        )
                    })}

                {collaboarators.length > 5 && (
                    <Avatar
                        label={`+${collaboarators.length - 5}`}
                        shape="circle"
                        size="large"
                        style={{
                            backgroundColor: "#9c27b0",
                            color: "#ffffff",
                        }}
                    />
                )}
            </AvatarGroup>
        </div>
    )
}
