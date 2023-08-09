import { useNavigate } from "react-router-dom"
import { AskAttending } from "./AskAttending"
import { AskResult } from "./AskResult"
import { CustomAvatarGroup } from "./CustomAvatarGroup"
import { InlineThingTemplate } from "./InlineThingTemplate"
import { ReputationInlinePreview } from "./ReputationInlinePreview"
import { ThingIntroduction } from "./ThingIntroduction"

export const Ask = ({ cache_item, cache, inline }) => {
    var nav = useNavigate()
    var first_transaction = uhc.find_first_transaction(cache_item.thing_id)
    if (inline === true) {
        return (
            <InlineThingTemplate onClick={() => nav(`/${cache_item.thing_id}`)}>
                <div>
                    <h1>{cache_item.thing.value.question}</h1>
                    <p>{cache_item.thing.value.question_body}</p>
                </div>
                <div>
                    <p>
                        this note was created in {first_transaction.time} by{" "}
                        {first_transaction.user_id}
                    </p>
                    <ReputationInlinePreview cache_item={cache_item} />
                    <CustomAvatarGroup thing_id={cache_item.thing_id} />
                </div>
            </InlineThingTemplate>
        )
    }
    return (
        <>
            <ThingIntroduction {...{ cache_item }} />

            {cache.find(
                (i) =>
                    i.thing.type === "ask_result" &&
                    i.thing.value.ask_id === cache_item.thing_id
            ) === undefined ? (
                <AskAttending ask_id={cache_item.thing_id} />
            ) : (
                <AskResult ask_id={cache_item.thing_id} />
            )}
        </>
    )
}
