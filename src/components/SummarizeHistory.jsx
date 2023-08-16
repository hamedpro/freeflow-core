import React, { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import moment from "moment"
import { useNavigate } from "react-router-dom"

export const SummarizeHistory = ({ cache_item }) => {
    var nav = useNavigate()
    var { cache, transactions } = useContext(UnifiedHandlerClientContext)
    var last_transaction = transactions
        .filter((tr) => tr.thing_id === cache_item.thing_id)
        .at(-1)
    return (
        <div>
            <label className="text-xl">
                {/* <i className="bi-clock-history mr-1" /> */}
                History
            </label>
            <p className="text-gray-600 text-sm">
                updated {moment(last_transaction.time).fromNow()} by{" "}
                {last_transaction.user_id === -1 && <span>{"<Server>"}</span>}
                {last_transaction.user_id === 0 && <span>{"<Ananymous>"}</span>}
                {last_transaction.user_id > 0 && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation()
                            nav(`/${last_transaction.user_id}`)
                        }}
                    >
                        {cache.find(
                            (ci) => ci.thing_id === last_transaction.user_id
                        )?.thing.value.email_address ||
                            `user #${last_transaction.user_id}`}
                    </span>
                )}
            </p>
        </div>
    )
}
