import React from "react"
import { useContext } from "react"
import { getDaysArray } from "../../api_dist/api/utils.js"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Chip } from "primereact/chip"
import { Panel } from "primereact/panel"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { custom_find_unique } from "../../api_dist/common_helpers"
import { ThingIntroduction } from "./ThingIntroduction.jsx"
import { useNavigate } from "react-router-dom"
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)
const UserProfile = ({ cache_item, inline }) => {
    var { transactions } = useContext(UnifiedHandlerClientContext)
    var user = cache_item
    var join_time = uhc.find_first_transaction(cache_item.thing_id).time
    var all_days_since_join = getDaysArray(new Date(join_time), new Date())

    var collaborations_chart_data = {
        labels: all_days_since_join.map((date, index, array) => {
            if (
                date.getDate() === 1 ||
                index === 0 ||
                index === array.length - 1
            ) {
                return date.toDateString()
            } else {
                return ""
            }
        }),
        datasets: [
            {
                label: "Day Contributions Count",
                data: all_days_since_join.map((date) => {
                    var start_time = new Date(date).getTime()
                    var end_time = new Date(date).getTime() + 3600 * 24 * 1000
                    return transactions.filter(
                        (tr) =>
                            tr.user_id === cache_item.thing_id &&
                            tr.time >= start_time &&
                            tr.time < end_time
                    ).length
                }),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    }
    var user_transactions = transactions.filter(
        (tr) => tr.user_id === cache_item.thing_id
    )
    var things_user_has_changed = custom_find_unique(
        user_transactions.map((tr) => tr.thing_id)
    ).map((thing_id) => ({
        thing_id,
        count: user_transactions.filter((i) => i.thing_id === thing_id).length,
    }))

    things_user_has_changed.sort((i1, i2) => {
        return i2.count - i1.count
    })
    var nav = useNavigate()
    if (inline)
        return (
            <div
                onClick={() => nav(`/${cache_item.thing_id}`)}
                className="cursor-pointer"
            >
                <ThingIntroduction cache_item={cache_item} />
            </div>
        )
    return (
        <div className="m-2 grid grid-cols-4 gap-4">
            <div className="col-start-1 col-span-3 row-start-1 row-span-1">
                <ThingIntroduction cache_item={cache_item} />
            </div>
            <div className="bg-white w-full p-4 shadow rounded col-start-4 col-span-1 row-start-1 row-span-1"></div>
            <div className="bg-white w-full p-0 shadow rounded col-start-1 col-span-3 row-start-2 row-span-1 relative overflow-hidden">
                <Panel header="Collaborations Over Time">
                    <Line
                        className="w-full"
                        data={collaborations_chart_data}
                        options={{
                            responsive: true,
                        }}
                    />
                    <hr className="mt-2" />
                    <h1 className="text-xl mt-4 underline underline-offset-8">
                        contributions frequency (first 10 items)
                    </h1>
                    <div className="py-4">
                        {things_user_has_changed
                            .slice(0, 10)
                            .map(({ thing_id, count }, index) => {
                                return (
                                    <p key={`${thing_id}-${count}`}>
                                        #{index + 1} : {thing_id} ({count})
                                    </p>
                                )
                            })}
                    </div>
                </Panel>
            </div>
        </div>
    )
}

export default UserProfile
