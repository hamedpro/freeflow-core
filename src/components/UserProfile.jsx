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
    if (inline)
        return (
            <div className="bg-white w-full p-0 shadow rounded relative overflow-hidden">
                <div
                    style={{
                        width: "100%",
                        height: "120px",

                        background:
                            "linear-gradient(-45deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
                    }}
                />
                <div
                    style={{
                        height: "140px",
                        width: "140px",
                        top: "120px",
                        left: "45px",
                        position: "absolute",
                        transform: "translateY(-50%)",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "3px solid white",
                    }}
                >
                    {user.thing.value.profile_image_file_id ? (
                        <img
                            src={
                                new URL(
                                    `/files/${
                                        user.thing.value.profile_image_file_id
                                    }?${uhc.jwt && "jwt=" + uhc.jwt}`,
                                    window.RESTFUL_API_ENDPOINT
                                ).href
                            }
                            className="w-full aspect-auto"
                        />
                    ) : (
                        <div className="w-full bg-gray-50 flex items-center justify-center flex-col aspect-square rounded border border-gray-200">
                            <i className="bi bi-person-vcard-fill text-gray-700 text-5xl" />
                        </div>
                    )}
                </div>
                <div className="w-full grid grid-cols-2">
                    <div>
                        {" "}
                        <div style={{ width: "100%", height: "70px" }} />
                        <div
                            className="py-3"
                            style={{
                                paddingLeft: "45px",
                                paddingRight: "45px",
                            }}
                        >
                            <h1 className="text-4xl">
                                {cache_item.thing.value.full_name || "No Name"}
                            </h1>
                            <div className="text-gray-600 mt-1 text-lg">
                                <i className="bi-envelope-check-fill mr-1" />{" "}
                                <span>
                                    {cache_item.thing.value.email_address}
                                </span>
                            </div>
                            <div className="flex space-x-1 mt-2 text-gray-600">
                                <i className="bi bi-tags-fill" />
                                <span> Tags: </span>
                                {(
                                    cache_item.thing.value.tags || [
                                        "Java",
                                        "Python",
                                        "JavaScript",
                                    ]
                                ).map((tag) => (
                                    <Chip
                                        key={tag}
                                        style={{ fontSize: "0.7rem" }}
                                        label={tag}
                                        icon="bi bi-tag"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div
                        className="py-3"
                        style={{
                            paddingLeft: "45px",
                            paddingRight: "45px",
                        }}
                    >
                        <h1 className="text-2xl underline underline-offset-8 text-gray-600">
                            Biography
                        </h1>
                        <p className="mt-4">
                            {cache_item.thing.value.biography ||
                                "This section has not been filled yet."}
                        </p>
                    </div>
                </div>
            </div>
        )
    return (
        <div className="m-2 grid grid-cols-4 gap-4">
            <div className="bg-white w-full p-0 shadow rounded col-start-1 col-span-3 row-start-1 row-span-1  relative overflow-hidden">
                <div
                    style={{
                        width: "100%",
                        height: "120px",

                        background:
                            "linear-gradient(-45deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
                    }}
                />
                <div
                    style={{
                        height: "140px",
                        width: "140px",
                        top: "120px",
                        left: "45px",
                        position: "absolute",
                        transform: "translateY(-50%)",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "3px solid white",
                    }}
                >
                    {user.thing.value.profile_image_file_id ? (
                        <img
                            src={
                                new URL(
                                    `/files/${
                                        user.thing.value.profile_image_file_id
                                    }?${uhc.jwt && "jwt=" + uhc.jwt}`,
                                    window.RESTFUL_API_ENDPOINT
                                ).href
                            }
                            className="w-full aspect-auto"
                        />
                    ) : (
                        <div className="w-full bg-gray-50 flex items-center justify-center flex-col aspect-square rounded border border-gray-200">
                            <i className="bi bi-person-vcard-fill text-gray-700 text-5xl" />
                        </div>
                    )}
                </div>
                <div className="w-full grid grid-cols-2">
                    <div>
                        {" "}
                        <div style={{ width: "100%", height: "70px" }} />
                        <div
                            className="py-3"
                            style={{
                                paddingLeft: "45px",
                                paddingRight: "45px",
                            }}
                        >
                            <h1 className="text-4xl">
                                {cache_item.thing.value.full_name || "No Name"}
                            </h1>
                            <div className="text-gray-600 mt-1 text-lg">
                                <i className="bi-envelope-check-fill mr-1" />{" "}
                                <span>
                                    {cache_item.thing.value.email_address}
                                </span>
                            </div>
                            <div className="flex space-x-1 mt-2 text-gray-600">
                                <i className="bi bi-tags-fill" />
                                <span> Tags: </span>
                                {(
                                    cache_item.thing.value.tags || [
                                        "Java",
                                        "Python",
                                        "JavaScript",
                                    ]
                                ).map((tag) => (
                                    <Chip
                                        key={tag}
                                        style={{ fontSize: "0.7rem" }}
                                        label={tag}
                                        icon="bi bi-tag"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div
                        className="py-3"
                        style={{
                            paddingLeft: "45px",
                            paddingRight: "45px",
                        }}
                    >
                        <h1 className="text-2xl underline underline-offset-8 text-gray-600">
                            Biography
                        </h1>
                        <p className="mt-4">
                            {cache_item.thing.value.biography ||
                                "This section has not been filled yet."}
                        </p>
                    </div>
                </div>
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
