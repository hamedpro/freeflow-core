import { Panel } from "primereact/panel"
import { InputTextarea } from "primereact/inputtextarea"
import { Button } from "primereact/button"
import { useState } from "react"
export const TextAnswerAsk = ({ cache_item, answer_an_ask }) => {
    var answers = cache_item.thing.value.answers || []
    var written_answer = answers.find(
        (ans) => ans.user_id === uhc.user_id
    )?.answer_text
    var [answer_textarea, set_answer_textarea] = useState("")

    return (
        <>
            <h1 className="mb-2">Answers</h1>
            {answers.map((ans, index) => (
                <div
                    key={index}
                    className="bg-white w-full rounded overflow-hidden shadow p-4 mb-2"
                >
                    answer : {ans.answer_text} by user #{ans.user_id}
                </div>
            ))}
            <Panel
                header={"submit your answer"}
                className="mt-4"
            >
                {written_answer === undefined ? (
                    <>
                        <InputTextarea
                            className="w-full"
                            rows={6}
                            onChange={(e) => {
                                set_answer_textarea(e.target.value)
                            }}
                            value={answer_textarea}
                        />

                        <Button
                            className="w-full flex justify-center"
                            onClick={() =>
                                answer_an_ask(cache_item.thing_id, {
                                    answer_text: answer_textarea,
                                    user_id: uhc.user_id,
                                })
                            }
                        >
                            <i className="bi-send-fill pr-2 " /> Submit Answer
                        </Button>
                    </>
                ) : (
                    <h1>
                        you have answered this question before. go edit that if
                        you want.
                    </h1>
                )}
            </Panel>
        </>
    )
}
