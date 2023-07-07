import React, { Fragment, useContext } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import ObjectBox from "./ObjectBox"
import {
    simple_int_range,
    sum_array,
    timestamp_filled_range,
    unique_items_of_array,
} from "../../common_helpers.js"
import { Section } from "./section"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

import { DayCalendarTimeBar } from "./DayCalendarTimeBar"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
ChartJS.register(ArcElement, Tooltip, Legend)
function Analytics({ calendar_categories, day_tasks, day_events }) {
    var { strings } = useContext(UnifiedHandlerClientContext)
    var day_tasks_percenatages = calendar_categories.map((cal_cat) => {
        return {
            name: cal_cat.thing.value.name,
            percent: Math.round(
                (sum_array(
                    day_tasks
                        .filter(
                            (i) =>
                                i.thing.value.category_id === cal_cat.thing_id
                        )
                        .map((i) => i.end_date - i.start_date)
                ) /
                    (3600 * 1000 * 24)) *
                    100
            ),
            color: cal_cat.thing.value.color,
            category_id: cal_cat.thing_id,
        }
    })
    day_tasks_percenatages.push({
        name: "empty",
        percent: Math.round(
            100 - sum_array(day_tasks_percenatages.map((i) => i.percent))
        ),
        color: "white",
    })
    var day_events_percenatages = calendar_categories.map((cal_cat) => {
        //it also includes done_tasks inside itself
        return {
            name: cal_cat.thing.value.name,
            percent: Math.round(
                (sum_array(
                    [
                        ...day_events.filter(
                            (i) =>
                                i.thing.value.category_id === cal_cat.thing_id
                        ),
                        ...day_tasks.filter((i) => {
                            return (
                                i.thing.value.category_id ===
                                    cal_cat.thing_id &&
                                i.thing.value.steps.every(
                                    (step) => step.is_done === true
                                )
                            )
                        }),
                    ].map((i) => i.end_date - i.start_date)
                ) /
                    (3600 * 1000 * 24)) *
                    100
            ),
            color: cal_cat.thing.value.color,
            category_id: cal_cat.thing_id,
        }
    })
    day_events_percenatages.push({
        name: "empty",
        percent: Math.round(
            100 - sum_array(day_events_percenatages.map((i) => i.percent))
        ),
        color: "white",
    })
    return (
        <>
            <Section title={strings[256]}>
                <div className="flex">
                    <div className="w-1/2">
                        <Pie
                            data={{
                                labels: day_tasks_percenatages.map(
                                    (i) => i.name
                                ),
                                datasets: [
                                    {
                                        label: strings[257],
                                        data: day_tasks_percenatages.map(
                                            (i) => i.percent
                                        ),
                                        backgroundColor:
                                            day_tasks_percenatages.map(
                                                (i) => i.color
                                            ),
                                        borderColor: "black",
                                    },
                                ],
                            }}
                        />
                    </div>
                    <div className="w-1/2">
                        <p>
                            {strings[258](
                                calendar_categories.length,
                                day_tasks.length,
                                day_tasks_percenatages.filter(
                                    (i) => i.percent !== 0 && i.name !== "empty"
                                ).length
                            )}
                        </p>
                        {day_tasks_percenatages.map((i, index) => {
                            return (
                                <p key={index}>
                                    {i.name} : {i.percent}%
                                </p>
                            )
                        })}
                    </div>
                </div>
            </Section>
            <Section title={strings[259]}>
                <div className="flex">
                    <div className="w-1/2">
                        <Pie
                            data={{
                                labels: day_events_percenatages.map(
                                    (i) => i.name
                                ),
                                datasets: [
                                    {
                                        label: strings[257],
                                        data: day_events_percenatages.map(
                                            (i) => i.percent
                                        ),
                                        backgroundColor:
                                            day_tasks_percenatages.map(
                                                (i) => i.color
                                            ),
                                        borderColor: "black",
                                    },
                                ],
                            }}
                        />
                    </div>

                    <div className="w-1/2">
                        <p>
                            {strings[260](
                                calendar_categories.length,
                                day_events.length,
                                day_tasks.filter((i) =>
                                    i.thing.value.steps.every(
                                        (step) => step.is_done === true
                                    )
                                ).length,
                                unique_items_of_array(
                                    [
                                        ...day_events,
                                        ...day_tasks.filter((i) =>
                                            i.thing.value.steps.every(
                                                (step) => step.is_done === true
                                            )
                                        ),
                                    ].map((i) => i.category_id)
                                ).length
                            )}
                        </p>
                        {day_events_percenatages.map((i, index) => {
                            return (
                                <p key={index}>
                                    {i.name} : {i.percent}%
                                </p>
                            )
                        })}
                    </div>
                </div>
            </Section>
            <Section title={strings[261]}>
                <h1>{strings[262]}</h1>
                {day_tasks.length !== 0 ? (
                    <p>
                        {strings[263](
                            (day_tasks.filter((i) =>
                                i.thing.value.steps.every(
                                    (step) => step.is_done === true
                                )
                            ).length /
                                day_tasks.length) *
                                100
                        )}
                    </p>
                ) : (
                    <p>{strings[264]}</p>
                )}

                <table>
                    <thead>
                        <tr>
                            <th>{strings[265]}</th>
                            <th>{strings[266]}</th>
                            <th>{strings[267]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calendar_categories.map((cal_cat, index) => {
                            return (
                                <tr key={cal_cat.thing_id}>
                                    <td>{cal_cat.thing.value.name}</td>
                                    <td>
                                        {
                                            day_tasks_percenatages.find(
                                                (i) =>
                                                    i.category_id ===
                                                    cal_cat.thing_id
                                            ).percent
                                        }
                                    </td>
                                    <td>
                                        {
                                            day_events_percenatages.find(
                                                (i) =>
                                                    i.category_id ===
                                                    cal_cat.thing_id
                                            ).percent
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Section>
        </>
    )
}
export const DayCalendar = () => {
    var { strings } = useContext(UnifiedHandlerClientContext)
    //detemine which time range to show (today or from url query (if present))
    var [searchParams, setSearchParams] = useSearchParams()
    var tmp = searchParams.get("default")

    if (tmp !== null) {
        var year = Number(tmp.split("-")[0])
        var month = Number(tmp.split("-")[1]) + 1
        var day = Number(tmp.split("-")[2])
    } else {
        var d = new Date()
        var year = d.getFullYear()
        var month = d.getMonth() + 1
        var day = d.getDate()
    }

    var start_timestamp = new Date(year, month - 1, day).getTime()
    var end_timestamp = start_timestamp + 3600 * 1000 * 24

    var { cache } = useContext(UnifiedHandlerClientContext)
    var nav = useNavigate()

    var tasks = cache.filter((i) => i.thing.type === "unit/task")
    var events = cache.filter((i) => i.thing.type === "unit/event")
    var calendar_categories = cache.filter(
        (i) => i.thing.type === "calendar_category"
    )

    var day_tasks = timestamp_filled_range({
        start: start_timestamp,
        end: end_timestamp,
        items: tasks,
    }).filter((i) => i.value !== null)

    var day_events = timestamp_filled_range({
        start: start_timestamp,
        end: end_timestamp,
        items: events,
    }).filter((i) => i.value !== null)
    function open_item_page(item) {
        if (item.value === null) {
            alert(strings[268])
            return
        }
        nav(`/dashboard/${item.thing_id}`)
    }

    return (
        <div className="p-2">
            <div>{strings[269]}</div>
            <p>
                {strings[270]} {start_timestamp} :{" "}
                {new Date(start_timestamp).toDateString()}
            </p>
            <p>
                {strings[271]} {end_timestamp} :{" "}
                {new Date(end_timestamp).toDateString()}
            </p>
            <Section title={strings[272]}>
                {strings[273]}{" "}
                {day_tasks.map((task) => {
                    return (
                        <Fragment key={task.thing_id}>
                            <ObjectBox object={task} />
                        </Fragment>
                    )
                })}
            </Section>
            <Section title={strings[274]}>
                {strings[275]}{" "}
                {day_events.map((event) => {
                    return (
                        <Fragment key={event.thing_id}>
                            <ObjectBox object={event} />
                        </Fragment>
                    )
                })}
            </Section>

            <Section title={strings[276]}>
                {[
                    {
                        start: start_timestamp,
                        end: start_timestamp + 12 * 3600 * 1000,
                        range_label: "day_half_1",
                    },
                    {
                        start: start_timestamp + 12 * 3600 * 1000,
                        end: end_timestamp,
                        range_label: "day_half_2",
                    },
                ].map((object, object_index) => {
                    return (
                        <div className="flex" key={object_index}>
                            <div className="w-1/5">
                                <div
                                    className="text-center"
                                    style={{ height: "30px" }}
                                >
                                    {strings[277]}
                                </div>
                                <div
                                    className="text-center"
                                    style={{ height: "30px" }}
                                >
                                    {strings[278]}
                                </div>
                                <div
                                    className="text-center"
                                    style={{ height: "30px" }}
                                >
                                    {strings[279]}
                                </div>
                            </div>
                            <div className="w-4/5">
                                <DayCalendarTimeBar
                                    items={simple_int_range({
                                        start:
                                            object.range_label === "day_half_1"
                                                ? 0
                                                : 12,
                                        end:
                                            object.range_label === "day_half_1"
                                                ? 11
                                                : 23,
                                    }).map((hour_number) => {
                                        return {
                                            text: hour_number,
                                            onClick: () => {},
                                            start_percent:
                                                (object.range_label ===
                                                "day_half_1"
                                                    ? hour_number
                                                    : hour_number - 12) *
                                                (100 / 12),
                                            end_percent:
                                                (object.range_label ===
                                                "day_half_1"
                                                    ? hour_number
                                                    : hour_number - 12) *
                                                    (100 / 12) +
                                                100 / 12,
                                            style: {},
                                        }
                                    })}
                                />
                                {[
                                    {
                                        items: JSON.parse(
                                            JSON.stringify(tasks)
                                        ),
                                        ...object,
                                        type_label: "tasks",
                                    },
                                    {
                                        items: JSON.parse(
                                            JSON.stringify(events)
                                        ),
                                        ...object,
                                        type_label: "events",
                                    },
                                ].map((type, type_index) => {
                                    return (
                                        <div
                                            key={type_index}
                                            className="w-full bg-stone-100 relative"
                                            style={{ height: "30px" }}
                                        >
                                            {timestamp_filled_range({
                                                ...type,
                                            })
                                                .map((item) => {
                                                    return {
                                                        ...item,
                                                        type_label:
                                                            type.type_label,
                                                    }
                                                })
                                                .map((item, index, array) => {
                                                    return (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                left:
                                                                    item.start_percent +
                                                                    "%",
                                                                width:
                                                                    item.end_percent -
                                                                    item.start_percent +
                                                                    "%",
                                                                height: "100%",
                                                                backgroundColor:
                                                                    item.value ===
                                                                    null
                                                                        ? "white"
                                                                        : calendar_categories.find(
                                                                              (
                                                                                  i
                                                                              ) => {
                                                                                  return (
                                                                                      i.thing_id ==
                                                                                      item
                                                                                          .thing
                                                                                          .value
                                                                                          .category_id
                                                                                  )
                                                                              }
                                                                          )
                                                                              .thing
                                                                              .value
                                                                              .color,
                                                                overflow:
                                                                    "hidden",
                                                                whiteSpace:
                                                                    "nowrap",
                                                                textOverflow:
                                                                    "ellipsis",
                                                            }}
                                                            className={`${
                                                                index !== 0
                                                                    ? "border-l"
                                                                    : ""
                                                            } ${
                                                                index !==
                                                                array.length - 1
                                                                    ? "border-r"
                                                                    : ""
                                                            } border-stone-400 flex justify-center items-center`}
                                                            onClick={() =>
                                                                open_item_page(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            {item.value !== null
                                                                ? item.thing
                                                                      .value
                                                                      .title
                                                                : "-"}
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </Section>
            <Analytics
                day_events={day_events}
                day_tasks={day_tasks}
                calendar_categories={calendar_categories}
            />
        </div>
    )
}
