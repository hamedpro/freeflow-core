import React, { useContext, useState } from "react"
import { Section } from "./section"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Timeline } from "primereact/timeline"
import { InlineTransaction } from "./InlineTransaction"
export const ThingTimeline = ({ transactions, cache_item }) => {
    var [tr_timeline_mode, set_tr_timeline_mode] = useState("short")
    var { strings } = useContext(UnifiedHandlerClientContext)
    return (
        <>
            <p>
                {strings[149]} {cache_item.thing_id}
            </p>
            <Section title={strings[150]}>
                {["short", "verbose"].map((mode) => (
                    <div
                        onClick={() => set_tr_timeline_mode(mode)}
                        key={mode}
                    >
                        <i
                            className={
                                mode === tr_timeline_mode
                                    ? "bi-toggle-on"
                                    : "bi-toggle-off"
                            }
                        />
                        <span>
                            {mode === "short" ? strings[152] : strings[151]}
                        </span>
                    </div>
                ))}
            </Section>
            <Timeline
                className="w-full"
                value={transactions}
                align="left"
                opposite={(tr) => `#${tr.id}`}
                content={(tr) => (
                    <InlineTransaction
                        transaction_id={tr.id}
                        mode={tr_timeline_mode}
                    />
                )}
            />
        </>
    )
}
