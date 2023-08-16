import { useNavigate } from "react-router-dom"
import { CustomAvatarGroup } from "./CustomAvatarGroup"
import { InlineThingTemplate } from "./InlineThingTemplate"
import { ReputationInlinePreview } from "./ReputationInlinePreview"
import { ThingIntroduction } from "./ThingIntroduction"
import { OptionBasedAsk } from "./OptionBasedAsk"
import { TextAnswerAsk } from "./TextAnswerAsk"

export const Ask = ({ cache_item, cache, inline }) => {
    var nav = useNavigate()
    var first_transaction = uhc.find_first_transaction(cache_item.thing_id)
    var { user_id } = uhc
    async function answer_an_ask(ask_id, answer) {
        //answer is defiend in types : ask_answer
        //if answer is undef it will delete
        //current answer (if exists)
        await uhc.request_new_transaction({
            new_thing_creator: (prev) => {
                if (prev.value.answers === undefined) {
                    prev.value.answers = []
                }

                prev.value.answers = prev.value.answers.filter(
                    (a) => a.user_id !== uhc.user_id
                )

                if (answer !== undefined) {
                    prev.value.answers.push(answer)
                }

                return prev
            },
            thing_id: ask_id,
        })
    }

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
            {cache_item.thing.value.mode === "poll" && (
                <OptionBasedAsk
                    cache_item={cache_item}
                    answer_an_ask={answer_an_ask}
                />
            )}
            {cache_item.thing.value.mode === "multiple_choice" && (
                <OptionBasedAsk
                    cache_item={cache_item}
                    answer_an_ask={answer_an_ask}
                />
            )}
            {cache_item.thing.value.mode === "text_answer" && (
                <TextAnswerAsk
                    cache_item={cache_item}
                    answer_an_ask={answer_an_ask}
                />
            )}
        </>
    )
}
