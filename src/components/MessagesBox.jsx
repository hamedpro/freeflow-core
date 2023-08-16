import { useContext } from "react"
import PersianDate from "persian-date"

import { Section } from "./section"
import { StyledDiv } from "./styled_elements"
import { Item, Menu, useContextMenu } from "react-contexify"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
export function MessagesBox({ thing_id }) {
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var { calendar_type } = useContext(VirtualLocalStorageContext)
    var messages_to_show = cache.filter((i) => {
        return (
            i.thing.type === "message" &&
            uhc.find_thing_meta(i.thing_id) !== undefined &&
            uhc.find_thing_meta(i.thing_id).thing.value.points_to === thing_id
        )
    })
    const edit_message_handler = async (message_id) => {
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => ({
                ...prev,
                value: { ...prev.value, text: window.prompt(strings[143]) },
            }),
            thing_id: message_id,
        })
    }
    async function new_message() {
        var new_message_id = await uhc.request_new_transaction({
            new_thing_creator: () => ({
                type: "message",
                value: {
                    text: document.getElementById("new_comment_text_input")
                        .value,
                },
            }),
            thing_id: undefined,
        })
        var new_meta_id = await uhc.request_new_transaction({
            new_thing_creator: () => ({
                type: "meta",
                value: {
                    thing_privileges:
                        uhc.find_thing_meta(thing_id).thing.value
                            .thing_privileges,
                    locks: [],
                    thing_id: new_message_id,
                    pack_id: null,
                    modify_thing_privileges: uhc.user_id,
                    points_to: thing_id,
                },
            }),
        })
    }

    var { show } = useContextMenu({
        id: "message_context_menu",
    })
    function handle_message_context_menu({ event, message_id }) {
        show({
            event,
            props: {
                message_id,
            },
        })
    }

    return (
        <>
            <Menu id="message_context_menu">
                <Item
                    id="edit"
                    onClick={(event) =>
                        edit_message_handler(event.props.message_id)
                    }
                >
                    {strings[144]}
                </Item>
            </Menu>
            <Section title={strings[145]}>
                {messages_to_show.map((cache_item) => (
                    <div
                        key={cache_item.thing_id}
                        className={`relative w-full flex ${
                            uhc.find_first_transaction(cache_item.thing_id)
                                .user_id === uhc.user_id
                                ? "justify-start"
                                : "justify-end"
                        }`}
                    >
                        <div
                            onContextMenu={(event) =>
                                handle_message_context_menu({
                                    event,
                                    message_id: cache_item.thing_id,
                                })
                            }
                            className="border border-blue-500 w-1/2 h-full mb-2 rounded p-2 relative"
                        >
                            <p className="mb-2">
                                {cache_item.thing.value.text}
                            </p>
                            <StyledDiv
                                className="w-fit mb-1 mx-1 absolute top-2 right-2 text-xs flex items-center justify-center opacity-70 hover:opacity-100"
                                onClick={(event) =>
                                    handle_message_context_menu({
                                        event,
                                        message_id: cache_item.thing_id,
                                    })
                                }
                            >
                                <i className="bi-three-dots" />
                            </StyledDiv>
                            <p className="text-xs">
                                {uhc.find_first_transaction(cache_item.thing_id)
                                    .user_id !== 0
                                    ? uhc.find_first_transaction(
                                          cache_item.thing_id
                                      ).user_id === -1
                                        ? strings[48]
                                        : cache.find(
                                              (i) =>
                                                  i.thing_id ===
                                                  uhc.find_first_transaction(
                                                      cache_item.thing_id
                                                  ).user_id
                                          ).thing.value.email_address
                                    : strings[47]}{" "}
                                |{" "}
                                {calendar_type === "english"
                                    ? new Date(
                                          uhc.find_first_transaction(
                                              cache_item.thing_id
                                          ).time
                                      ).toLocaleString()
                                    : new PersianDate(
                                          uhc.find_first_transaction(
                                              cache_item.thing_id
                                          ).time
                                      ).format("LLLL")}
                            </p>
                        </div>
                    </div>
                ))}
                <hr />
                <div className="flex items-center pt-2">
                    <div className="w-4/5 flex items-center">
                        <textarea
                            placeholder={strings[146]}
                            className=" mx-2 px-1 w-full rounded "
                            id="new_comment_text_input"
                        />
                    </div>

                    <div className="w-1/5">
                        <button
                            className="w-full h-full flex items-center justify-center"
                            onClick={new_message}
                        >
                            {strings[147]}
                        </button>
                    </div>
                </div>
            </Section>
        </>
    )
}
