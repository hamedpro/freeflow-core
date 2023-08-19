import { useContext, useState } from "react"
import { TabMenu } from "primereact/tabmenu"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Button } from "primereact/button"

import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from "chart.js"
ChartJS.register(ArcElement, Tooltip, Legend, Colors)
export const OptionBasedAsk = ({ cache_item, answer_an_ask }) => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var answers = cache_item.thing.value.answers || []
    var options = cache_item.thing.value.options

    var selected_index = answers.find(
        (result) => result.user_id === uhc.user_id
    )?.answer_index

    var chart_data = {
        labels: options,
        datasets: [
            {
                label: "percentage",
                data: options.map((opt) => {
                    return (
                        answers.filter(
                            (result) =>
                                result.answer_index === options.indexOf(opt)
                        ).length / answers.length
                    )
                }),

                borderWidth: 1,
            },
        ],
    }
    var [tab_menu_active_option, set_tab_menu_active_option] = useState(0)
    return (
        <>
            <div className="grid grid-cols-2 gap-x-4">
                <div className="bg-white shadow p-4 rounded flex flex-col space-y-2">
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl">options</h1>
                        {selected_index !== undefined && (
                            <Button
                                className="text-xs h-8"
                                outlined
                                onClick={() =>
                                    answer_an_ask(
                                        cache_item.thing_id,
                                        undefined
                                    )
                                }
                            >
                                reset
                            </Button>
                        )}
                    </div>

                    {options.map((opt, index) => (
                        <Button
                            key={index}
                            icon={
                                selected_index === index ? (
                                    <i className="bi-check2-circle pr-2" />
                                ) : undefined
                            }
                            outlined={selected_index !== index}
                            iconPos="right"
                            onClick={() => {
                                answer_an_ask(cache_item.thing_id, {
                                    user_id: uhc.user_id,
                                    answer_index: index,
                                })
                            }}
                        >
                            {opt}
                        </Button>
                    ))}
                </div>
                <div className="bg-white shadow p-4 rounded">
                    <h1 className="mb-2">results</h1>
                    {selected_index === undefined ? (
                        <h1>
                            once you select an option you can see the results.
                        </h1>
                    ) : answers.length === 0 ? (
                        <h1>there is not any vote yet !</h1>
                    ) : (
                        <Pie
                            data={chart_data}
                            options={{
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                        align: "start",
                                    },
                                },
                            }}
                        />
                    )}
                    {}
                </div>
            </div>
            <div className="bg-white w-full rounded mt-4 shadow overflow-hidden">
                <TabMenu
                    model={options.map((opt) => ({ label: opt }))}
                    activeIndex={tab_menu_active_option}
                    onTabChange={(e) => set_tab_menu_active_option(e.index)}
                />
                <div className="p-4">
                    {
                        answers.filter(
                            (ans) => ans.answer_index === tab_menu_active_option
                        ).length
                    }{" "}
                    user/users has/have selected this option :
                    {answers
                        .filter(
                            (ans) => ans.answer_index === tab_menu_active_option
                        )
                        .map((ans, index) => (
                            <p key={index}>
                                {
                                    cache.find(
                                        (ci) => ans.user_id === ci.thing_id
                                    ).thing.value.email_address
                                }
                            </p>
                        ))}
                </div>
            </div>
        </>
    )
}
