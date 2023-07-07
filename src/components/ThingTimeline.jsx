import React, { useContext, useState } from "react"
import { TransactionsTimeline } from "./TransactionsTimeline"
import { Section } from "./section"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const ThingTimeline = ({ thing_transactions, cache_item }) => {
    var [tr_timeline_mode, set_tr_timeline_mode] = useState("short")
    var { strings } = useContext(UnifiedHandlerClientContext)
    return (
        <>
            <p>
                {strings[149]} {cache_item.thing_id}
            </p>
            <Section title={strings[150]}>
                {["short", "verbose"].map((mode) => (
                    <div onClick={() => set_tr_timeline_mode(mode)} key={mode}>
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
            <TransactionsTimeline
                transactions={thing_transactions}
                mode={tr_timeline_mode}
            />
        </>
    )
}
