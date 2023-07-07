import React, { useContext } from "react";
import { new_calendar_category } from "../../api/client";

import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

export const NewCalendarCategorySection = () => {
	var { cache, strings } = useContext(UnifiedHandlerClientContext)
    return (
        <Section
            className="mt-2"
            title={strings[223]}
            style={{ padding: "0px", marginX: "0px" }}
        >
            <p>{strings[224]}</p>
            <input
                className="px-1 rounded"
                id="new_calendar_category_name_input"
            />
            <p className="mt-2">
                {strings[225]}
                "yellow","red","blue","darkblue","green","purple","black"
            </p>
            <input
                id="new_calendar_category_color_input"
                className="block px-1 rounded"
            />
            <StyledDiv
                className="w-fit mt-2"
                onClick={async () => {
                    var new_cc_id = await uhc.request_new_transaction({
                        new_thing_creator: () => ({
                            type: "calendar_category",
                            value: {
                                name: document.getElementById(
                                    "new_calendar_category_name_input"
                                ).value,
                                color: document.getElementById(
                                    "new_calendar_category_color_input"
                                ).value,
                            },
                        }),
                        thing_id: undefined,
                    })
                    var new_meta_id = await uhc.request_new_transaction({
                        new_thing_creator: () => ({
                            type: "meta",
                            value: {
                                thing_privileges: { read: "*", write: "*" },
                                modify_thing_privileges: uhc.user_id,
                                locks: [],
                                thing_id: new_cc_id,
                            },
                        }),
                        thing_id: undefined,
                    })

                    alert(strings[226])
                }}
            >
                {strings[227]}
            </StyledDiv>
        </Section>
    )
};
