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
            <div className="text-xl">
                {/* <i className="bi-clock-history mr-1" /> */}
                <span>Reputation Rank:</span>
                <p className="text-xs text-gray-600">(lower is better)</p>
            </div>
            <p className="text-gray-600 text-sm mt-2">
                {`${reputation_rank} / ${cache.length} `}

                <span>
                    {`(in top ${
                        Math.ceil(rounded_reputation_percent / 10) * 10
                    } % )`}
                </span>
            </p>
        </div>
    )
}
