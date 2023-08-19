import React, { useRef, useState } from "react"
import { FileUpload } from "primereact/fileupload"
import { useNavigate } from "react-router-dom"
import { InputTextarea } from "primereact/inputtextarea"
import { Panel } from "primereact/panel"
import { Paginator } from "primereact/paginator"
import { useContext } from "react"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { SlideMenu } from "primereact/slidemenu"
import { Thing } from "./Thing"
import { InlineTransaction } from "./InlineTransaction"
import { Button } from "primereact/button"
import { InputSwitch } from "primereact/inputswitch"
import { Calendar } from "primereact/calendar"
import { InputNumber } from "primereact/inputnumber"
import { custom_deepcopy } from "../../api_dist/api/utils"
import { Section } from "./section"
import { StyledDiv } from "./styled_elements"
import { RadioButton } from "primereact/radiobutton"
import { InputText } from "primereact/inputtext"
import { Card } from "primereact/card"
function NewResource() {
    var nav = useNavigate()
    async function uploadHandler(event) {
        try {
            var file
            for (file of event.files) {
                await uhc.submit_new_resource({
                    file,
                    nav,
                    title: file.name,
                    thing_privileges: {
                        read: [uhc.user_id],
                        write: [uhc.user_id],
                    },
                    pack_id: undefined,
                    description: "",
                    create_more: event.files.length === 1 ? false : true,
                })
            }
        } catch (error) {
            console.log(error)
            alert("something went wrong during uploading those resource")
        } finally {
            //deleting all options anyway
            event.options.clear()
        }
    }
    return (
        <>
            <FileUpload
                customUpload
                uploadHandler={uploadHandler}
                multiple
                emptyTemplate={
                    <p className="m-0">
                        Drag and drop files to here to upload.
                    </p>
                }
            />
        </>
    )
}
function NewNote() {
    var nav = useNavigate()

    var [is_waiting, set_is_waiting] = useState(true)
    var [note_id, set_note_id] = useState()

    var flag = useRef(false)

    var on_change = async (e) => {
        if (flag.current === false) {
            flag.current = true
            set_is_waiting(true)
            uhc.bootstrap_a_writing({
                text: e.target.value,
                nav,
            }).then((new_note_id) => {
                set_note_id(new_note_id)
                set_is_waiting(false)
            })
        }
        if (typeof note_id === "number") {
            set_is_waiting(true)
            await uhc.request_new_transaction({
                thing_id: note_id,
                new_thing_creator: (prev) => ({
                    ...prev,
                    value: {
                        ...prev.value,
                        data: {
                            blocks: [
                                {
                                    type: "paragraph",
                                    data: {
                                        text: e.target.value,
                                    },
                                },
                            ],
                        },
                    },
                }),
            })
            set_is_waiting(false)
        }
    }
    var nav = useNavigate()
    return (
        <Panel header={"New Writing"}>
            <InputTextarea
                onChange={on_change}
                autoResize
                className="w-full"
                rows={8}
            />
            <br />

            <Button
                className="w-full h-10 flex justify-center"
                disabled={is_waiting}
                onClick={() => nav(`/${note_id}`)}
            >
                {is_waiting === true ? "waiting..." : "Open Note"}
            </Button>
        </Panel>
    )
}
function NewAsk() {
    var nav = useNavigate()
    var { cache, strings } = useContext(UnifiedHandlerClientContext)

    //possible modes : "poll" , "multiple_choice" , "text_answer"
    var [selected_mode, set_selected_mode] = useState("poll")

    /* if selected_mode is poll or multiple_choice
    it holds those its options */
    var [current_mode_options, set_current_mode_options] = useState([])

    var [
        multiple_choice_correct_option_index,
        set_multiple_choice_correct_option_index,
    ] = useState()

    async function submit_new_ask() {
        if (
            selected_mode === "multiple_choice" &&
            multiple_choice_correct_option_index === undefined
        ) {
            alert(strings[237])
            return
        }

        try {
            var tmp = {
                question: document.getElementById("question").value,
            }

            //appending options
            if (selected_mode === "poll") {
                tmp.options = current_mode_options
            } else if (selected_mode === "multiple_choice") {
                tmp.options = current_mode_options
                tmp.correct_option_index = multiple_choice_correct_option_index
            }

            //assiging mode :
            tmp.mode = selected_mode

            await uhc.bootstrap_an_ask(tmp, (id_of_new_ask) => {
                alert(strings[64])
                nav(`/${id_of_new_ask}`)
            })
        } catch (error) {
            console.log(error)
            alert(strings[8])
        }
    }

    function add_new_option() {
        set_current_mode_options((prev) => [
            ...prev,
            window.prompt(strings[238]),
        ])
    }

    return (
        <div className="p-2">
            <h1>{strings[240]}</h1>

            <h1 className="mt-2">{strings[241]}</h1>
            <input
                id="question"
                className="border border-blue-400 px-1 rounded"
            />
            <p>{strings[242]}</p>
            {["multiple_choice", "poll", "text_answer"].map((mode) => (
                <div
                    onClick={() => set_selected_mode(mode)}
                    key={mode}
                >
                    <i
                        className={
                            selected_mode === mode
                                ? "bi-toggle-on"
                                : "bi-toggle-off"
                        }
                    />{" "}
                    {mode === "multiple_choice" && <span>{strings[243]}</span>}
                    {mode === "poll" && <span>{strings[244]}</span>}
                    {mode === "text_answer" && <span>{strings[245]}</span>}
                </div>
            ))}
            {selected_mode !== "text_answer" && (
                <Section title={strings[246]}>
                    {(selected_mode === "poll" ||
                        selected_mode === "multiple_choice") && (
                        <>
                            <button onClick={add_new_option}>
                                {strings[247]}
                            </button>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{strings[248]}</th>
                                        <th>{strings[249]}</th>
                                        {selected_mode ===
                                            "multiple_choice" && (
                                            <th>{strings[250]}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {current_mode_options.map(
                                        (option, index) => (
                                            <tr
                                                key={Math.round(
                                                    Math.random() * 1000
                                                )}
                                            >
                                                <td>{index}</td>
                                                <td>{option}</td>
                                                {selected_mode ===
                                                    "multiple_choice" && (
                                                    <td>
                                                        {index ===
                                                        multiple_choice_correct_option_index
                                                            ? strings[251]
                                                            : strings[252]}
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                    {selected_mode === "multiple_choice" && (
                        <button
                            onClick={() =>
                                set_multiple_choice_correct_option_index(
                                    Number(prompt(strings[253]))
                                )
                            }
                        >
                            {strings[254]}
                        </button>
                    )}
                </Section>
            )}

            <StyledDiv
                onClick={submit_new_ask}
                className="w-fit mt-2"
            >
                {strings[255]}
            </StyledDiv>
        </div>
    )
}
function NewPack() {
    var nav = useNavigate()
    var [title, set_title] = useState()
    function onclick_handler() {
        window.uhc.bootstrap_a_pack({
            title,
            callback: (id_of_new_pack) => nav(`/${id_of_new_pack}`),
        })
    }
    return (
        <Panel
            header={
                <>
                    <i className="bi bi-box pr-2" />
                    <span>New Pack</span>{" "}
                </>
            }
        >
            <p className="mb-3">
                Packs are just like a folder in your OS of choice. create one
                just with a title and add whatever you wanna to it at any time.
            </p>

            <br />
            <div className="p-inputgroup">
                <InputText
                    placeholder="title"
                    id="new_pack_title"
                    onChange={(e) => set_title(e.target.value)}
                />
                <Button
                    disabled={title === undefined || title === ""}
                    onClick={onclick_handler}
                >
                    <i
                        className="bi-folder-plus pr-2"
                        style={{ fontSize: "large" }}
                    />{" "}
                    <span style={{ fontSize: "small" }}>Create New Pack</span>
                </Button>
            </div>

            <span className="block text-xs text-gray-600 w-full md:w-30rem mt-2">
                {title === "" && "title can not be empty"}
            </span>
        </Panel>
    )
}
export const NewUnitShortcuts = () => {
    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <div className="grid col-span-1">
                <NewNote />
            </div>
            <div className="grid col-span-1">
                <NewResource />
            </div>

            <div className="grid col-span-1">
                <NewAsk />
            </div>

            <div className="grid col-span-1">
                <NewPack />
            </div>
        </div>
    )
}

export const ProfilesSlideMenu = () => {
    var nav = useNavigate()
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    var { cache, strings } = useContext(UnifiedHandlerClientContext)
    function select_profile(new_user_id) {
        set_virtual_local_storage((prev) => ({
            ...prev,
            profiles_seed: prev.profiles_seed.map((seed) => ({
                ...seed,
                is_active: seed.user_id === new_user_id,
            })),
        }))
    }
    var profiles_items = profiles_seed.map((profile) => {
        var label = `${strings[46]} #${profile.user_id}`
        if (profile.user_id === 0) {
            label = strings[47]
        } else if (profile.user_id === -1) {
            label = strings[48]
        } else {
            var t = cache.find(
                (cache_item) => cache_item.thing_id === profile.user_id
            )
            if (t !== undefined) {
                label = t.thing.value.email_address || t.thing.value.full_name
            }
        }
        return {
            label,
            command: () => {
                select_profile(profile.user_id)
            },
            active: profile.is_active,
            code: profile.user_id,
            icon: icon(profile.user_id),
        }
    })
    var model = [
        {
            items: profiles_items,
            ...profiles_items.find((i) => i.active),
            ...{ command: undefined },
        },
        {
            label: "Add existing account",
            command: () => nav("/login"),
        },
        { label: "Register an account", command: () => nav("/register") },
        { separator: true },

        {
            label: "Logout",
            command: () => {
                var current_user_id = profiles_seed.find(
                    (prof_seed) => prof_seed.is_active === true
                ).user_id
                if (current_user_id === 0) {
                    alert("you can not log out of anonymous.")
                } else {
                    select_profile(0)
                    set_virtual_local_storage((prev) => ({
                        ...prev,
                        profiles_seed: prev.profiles_seed.filter(
                            (profile_seed) =>
                                profile_seed.user_id !== current_user_id
                        ),
                    }))
                }
            },
        },
    ]

    function icon(code) {
        var profile_image_file_id = cache.find(
            (cache_item) => cache_item.thing_id === code
        )?.thing.value?.profile_image_file_id

        return (
            <>
                {code === -1 && <i className="bi-person-fill pr-2"> </i>}
                {code === 0 && <i className="bi-people pr-2"> </i>}
                {code > 0 &&
                    (profile_image_file_id ? (
                        <img
                            src={
                                new URL(
                                    `/files/${profile_image_file_id}?${
                                        uhc.jwt && "jwt=" + uhc.jwt
                                    }`,
                                    window.RESTFUL_API_ENDPOINT
                                ).href
                            }
                            style={{
                                width: "25px",
                                height: "25px",
                                borderRadius: "100%",
                            }}
                        />
                    ) : (
                        <i className="bi-person pr-2"></i>
                    ))}
            </>
        )
    }
    return (
        <SlideMenu
            model={model}
            viewportHeight={210}
            menuWidth={270}
            style={{ width: "270px", height: "210px" }}
        />
    )
}
export function InlineThingWidget({ title, thing_ids }) {
    return (
        <CustomPaginatorPanel
            title={title}
            items={thing_ids.map((thing_id) => (
                <Thing
                    key={thing_id}
                    thing_id={thing_id}
                    inline
                />
            ))}
        />
    )
}
export function CustomPaginatorPanel({
    title,
    items,
    items_per_page = 20,
    ...props
}) {
    var [current_page, set_current_page] = useState(0)

    var first = current_page * 20
    return (
        <div className="flex flex-col space-y-2">
            <div className="bg-white p-4 shadow w-full flex items-center justify-between rounded h-20">
                <h1 className="text-2xl">{title}</h1>
                <span>{items.length} items</span>
            </div>

            {items.length === 0 && "there is nothing to show."}
            {items.slice(
                current_page * items_per_page,
                current_page * items_per_page + items_per_page
            )}
            {items.length > items_per_page && (
                <Paginator
                    first={first}
                    rows={items_per_page}
                    totalRecords={items.length}
                    onPageChange={(e) => set_current_page(e.page)}
                />
            )}
        </div>
    )
}

export function Feed() {
    return (
        <InlineThingWidget
            title={"Feed"}
            thing_ids={uhc.recommend_to_me()}
            items_per_page={12}
        />
    )
}

export function Saved() {
    var saved_things = uhc.user?.thing.value.saved_things || []
    return (
        <>
            <InlineThingWidget
                title="Saved"
                items_per_page={12}
                thing_ids={saved_things}
            />
        </>
    )
}
export function InlineTransactionWidget({
    title,
    transactions,
    mode = "short",
}) {
    return (
        <CustomPaginatorPanel
            title={title}
            items={transactions.map((tr) => (
                <InlineTransaction
                    key={tr.id}
                    transaction_id={tr.id}
                    mode={mode}
                />
            ))}
        />
    )
}
export function WhatsHappeningWidget() {
    var watched_things = uhc.user?.thing.value.watched_things || []
    var { transactions } = useContext(UnifiedHandlerClientContext)
    var transactions_to_show = transactions.filter((tr) =>
        watched_things.includes(tr.thing_id)
    )
    return (
        <InlineTransactionWidget
            transactions={transactions_to_show}
            title="Whats Happening"
        />
    )
}
export function MetroButton({ bi, text, link, ...props }) {
    var nav = useNavigate()
    return (
        <Button
            {...props}
            size="large"
            onClick={() => nav(link)}
            severity="info"
            icon={<i className={`text-3xl ${bi} px-3`} />}
        >
            <span>{text}</span>
        </Button>
    )
}
export function SyncCentreWidget() {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var { profiles_seed, set_virtual_local_storage } = useContext(
        VirtualLocalStorageContext
    )
    function change_max_sync_depth(new_value) {
        if (
            !(
                new_value === undefined ||
                (typeof new_value === "number" && new_value >= 1)
            )
        ) {
            return
        }

        set_virtual_local_storage((prev) => {
            var clone = custom_deepcopy(prev)
            clone.profiles_seed.find(
                (profile_seed) => profile_seed.is_active === true
            ).max_sync_depth = new_value
            return clone
        })
    }
    var active_profile = profiles_seed.find(
        (profile_seed) => profile_seed.is_active === true
    )
    return (
        <Panel
            className="h-full"
            header={
                <div className="flex space-x-2">
                    <i className={`bi-clock-history font-bold`} />
                    <span>Sync Centre</span>
                </div>
            }
        >
            <>
                <p>
                    you have access to {cache.length} things over the network.
                    some of them may have hundereds or thousands of changes from
                    their beginning. "max depth" is maximum number of changes
                    you want to fetch for each thing. minimum is 1 which means
                    you just want to be synced with latest change of those
                    things.
                </p>

                <label
                    htmlFor="max_sync_depth_undefined"
                    className="font-bold block mb-2"
                >
                    sync without limit
                </label>

                <InputSwitch
                    inputId="max_sync_depth_undefined"
                    checked={active_profile.max_sync_depth === undefined}
                    onChange={(e) =>
                        change_max_sync_depth(e.value === true ? undefined : 3)
                    }
                />

                {active_profile.max_sync_depth !== undefined && (
                    <>
                        <label
                            htmlFor="max_depth"
                            className="font-bold block mb-2"
                        >
                            Max Sync Depth
                        </label>
                        <InputNumber
                            min={1}
                            inputId="max_depth"
                            value={active_profile.max_sync_depth}
                            onValueChange={(e) => {
                                change_max_sync_depth(e.value)
                            }}
                        />
                    </>
                )}
            </>
        </Panel>
    )
}
export function TimeTravel() {
    var { time_travel_snapshot, transactions } = useContext(
        UnifiedHandlerClientContext
    )
    return (
        <div className="grid grid-cols-5 gap-x-4 py-4 mb-4">
            <div className="rounded col-span-3 row-span-2 bg-red-500 flex items-start flex-col justify-center px-5 text-white font-bold ">
                <div>
                    <i className={`bi-clock-history text-5xl pr-2`} />
                    <span className="text-5xl">Time Travel!</span>
                </div>

                <p className="my-2">
                    using Time machine feature you can sync entire application
                    data with any previous state of entire data.
                </p>
            </div>
            <div className="col-span-2 row-span-1 bg-blue-600 rounded-t">
                <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center">
                        <RadioButton
                            inputId="timestamp"
                            name="time_travel_snapshot"
                            value="timestamp"
                            onChange={(e) =>
                                window.uhc.time_travel({
                                    type: "timestamp",
                                    value: new Date().getTime(),
                                })
                            }
                            checked={
                                time_travel_snapshot !== undefined &&
                                time_travel_snapshot.type === "timestamp"
                            }
                        />
                        <label
                            htmlFor="timestamp"
                            className="ml-2"
                        >
                            timestamp mode
                        </label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="transaction_id"
                            name="time_travel_snapshot"
                            value="Mushroom"
                            onChange={(e) =>
                                window.uhc.time_travel({
                                    type: "transaction_id",
                                    value: transactions.at(-1)?.id || 1,
                                })
                            }
                            checked={
                                time_travel_snapshot !== undefined &&
                                time_travel_snapshot.type === "transaction_id"
                            }
                        />
                        <label
                            htmlFor="transaction_id"
                            className="ml-2"
                        >
                            Transaction id
                        </label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="without_timestamp"
                            name="time_travel_snapshot"
                            value="Mushroom"
                            onChange={(e) => window.uhc.time_travel(undefined)}
                            checked={time_travel_snapshot === undefined}
                        />
                        <label
                            htmlFor="without_timestamp"
                            className="ml-2"
                        >
                            without limit
                        </label>
                    </div>
                </div>
            </div>

            <div className="col-span-2 row-span-1 bg-blue-900 p-4 text-white rounded-b">
                {time_travel_snapshot === undefined &&
                    "all synced transactions of this profile are used."}
                {time_travel_snapshot !== undefined &&
                    time_travel_snapshot.type === "timestamp" && (
                        <Calendar
                            value={new Date(time_travel_snapshot.value)}
                            onChange={(e) => {
                                new Date(e.value).toString()
                                console.log(new Date(e.value).getTime())

                                window.uhc.time_travel({
                                    type: "timestamp",
                                    value: new Date(e.value).getTime(),
                                })
                            }}
                            showTime
                            hourFormat="12"
                            showIcon
                        />
                    )}
                {time_travel_snapshot !== undefined &&
                    time_travel_snapshot.type === "transaction_id" && (
                        <div className="flex flex-wrap gap-3">
                            <label
                                htmlFor="transaction_id_snapshot"
                                className="font-bold block mb-2"
                            >
                                Transaction id
                            </label>
                            <InputNumber
                                inputId="transaction_id_snapshot"
                                value={time_travel_snapshot.value}
                                onValueChange={(e) =>
                                    window.uhc.time_travel({
                                        type: "transaction_id",
                                        value: e.value,
                                    })
                                }
                                min={1}
                            />
                        </div>
                    )}
            </div>
        </div>
    )
}
