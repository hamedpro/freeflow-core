import React, { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const WhatsHappening = () => {
    var { transactions } = useContext(UnifiedHandlerClientContext)
    var related_transactions = transactions.filter((tr) =>
        uhc.things_i_watch().includes(tr.thing_id)
    )

    return (
        <>
            <h1>WhatsHappening</h1>
            <div>
                {related_transactions.map((tr_id) => (
                    <span key={tr_id}>--transaction with id {tr_id}--</span>
                ))}
            </div>
        </>
    )
}
