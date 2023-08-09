import { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export const ReputationInlinePreview = ({ cache_item }) => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var reputation_rank =
        uhc.calc_reputations().indexOf(cache_item.thing_id) + 1
    var rounded_reputation_percent = Math.ceil(
        (reputation_rank / cache.length) * 100
    )
    return (
        <div className="text-lg">
            <i className="bi-award" />
            <span>
                {`Reputation : ${reputation_rank} / ${cache.length} `}
                {`(top ${Math.ceil(rounded_reputation_percent / 10) * 10} % )`}
            </span>
        </div>
    )
}
