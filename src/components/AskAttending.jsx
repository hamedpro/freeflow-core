import { useContext, useState } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export function AskAttending({ ask_id }) {
    var user_id = uhc.user_id
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    var [selected_option_index, set_selected_option_index] = useState()

    var ask = cache.find((i) => i.thing_id === ask_id)

    return (
        <>
            <h1>{ask.thing.value.question}</h1>
            {ask.thing.value.mode === "text_answer" && (
                <>
                    <input id="text_answer_input" />
                    <button onClick={handle_text_answer_ask}>
                        {strings[131]}
                    </button>
                </>
            )}
            {(ask.thing.value.mode === "multiple_choice" ||
                ask.thing.value.mode === "poll") && (
                <>
                    {ask.thing.value.options.map((option, index) => (
                        <div
                            onClick={() => set_selected_option_index(index)}
                            key={index}
                        >
                            <p>
                                <i
                                    className={
                                        selected_option_index === index
                                            ? "bi-toggle-on"
                                            : "bi-toggle-off"
                                    }
                                />
                                {option}
                            </p>
                        </div>
                    ))}
                    <button onClick={handle_option_based_ask}>
                        {strings[132]}{" "}
                    </button>
                </>
            )}
        </>
    )
}
