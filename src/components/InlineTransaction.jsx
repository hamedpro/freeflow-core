import React, { Fragment, useContext, useState } from "react"
import { Section } from "./section"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { JsonViewer } from "@textea/json-viewer"
import {
    TransactionInterpreter,
    calc_complete_transaction_diff,
} from "../../api_dist/api/utils"
function TransactionContent({ tr, mode }) {
    var { transactions } = useContext(UnifiedHandlerClientContext)
    var interpreted_tr = new TransactionInterpreter(transactions, tr.id)

    //console.log(interpreted_tr.matching_patterns_results);
    if (mode === "raw") {
        return <JsonViewer value={tr} />
    } else if (interpreted_tr.matching_patterns_results.length !== 0) {
        return (
            <Section title={"matching patterns"}>
                {interpreted_tr.matching_patterns_results.map(
                    (patt, index, array) => (
                        <Fragment key={Math.random()}>
                            <p>{patt[mode]}</p>
                            {index !== array.length - 1 && <hr />}
                        </Fragment>
                    )
                )}
            </Section>
        )
    } else {
        return tr.diff.map((diff_part, index) => {
            var { val, op, path } = diff_part

            if (op === "update") {
                return (
                    <span key={index}>
                        updated {path.join("/")} : set it to{" "}
                        {JSON.stringify(val)}
                    </span>
                )
            } else if (op === "add") {
                return (
                    <span key={index}>
                        added {path.join("/")} : set it to {JSON.stringify(val)}
                    </span>
                )
            } else if (op === "delete") {
                return <span key={index}>deleted {path.join("/")}</span>
            }
        })
    }
}
export const InlineTransaction = ({
    transaction_id,
    mode /* raw | short | verbose */,
}) => {
    var { transactions } = useContext(UnifiedHandlerClientContext)
    var tr = transactions.find((tr) => tr.id === transaction_id)

    return (
        <Section>
            {tr ? (
                <TransactionContent
                    tr={tr}
                    mode={mode}
                />
            ) : (
                "requested transaction could not be found to be interpret."
            )}
        </Section>
    )
}
