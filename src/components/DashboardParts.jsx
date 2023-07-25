import React, { useRef, useState } from "react"
import { FileUpload } from "primereact/fileupload"
import { useNavigate } from "react-router-dom"
import { InputTextarea } from "primereact/inputtextarea"
import { ProgressBar } from "primereact/progressbar"
import { Panel } from "primereact/panel"
import { Paginator } from "primereact/paginator"
import { useContext } from "react"
import { VirtualLocalStorageContext } from "../VirtualLocalStorageContext"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { SlideMenu } from "primereact/slidemenu"
import { Thing } from "./Thing"
import { TabMenu } from "primereact/tabmenu"
import { InlineTransaction } from "./InlineTransaction"
import { Button } from "primereact/button"
import { InputSwitch } from "primereact/inputswitch"

import { InputNumber } from "primereact/inputnumber"
import { custom_deepcopy } from "../../api_dist/api/utils"

function NewResource() {
    var nav = useNavigate()
    async function uploadHandler(event) {
        try {
            var file
            for (file of event.files) {
                await uhc.upload_files_handler({
                    file,
                    nav,
                    title: file.name,
                    thing_privileges: { read: [uhc.user_id] },
                    pack_id: undefined,
                    description: "",
                    create_more: true,
                })
            }
        } finally {
            event.options.clear()
        }
    }
    return (
        <>
            <FileUpload
                name="file"
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
    var [value, set_value] = useState("")
    var nav = useNavigate()
    var progress_started = useRef(false)
    var on_change = (e) => {
        set_value(e.target.value)
        if (progress_started.current === false && value.length >= 20) {
            progress_started.current = true
            uhc.bootstrap_a_writing({
                text: value,
                nav,
            })
        }
    }

    return (
        <Panel header={"start a writing!"}>
            <p className="px-4 py-2 text-sm">
                start typing. once you hit 20 carachters a note is created
                automatically.
            </p>
            <InputTextarea
                onChange={on_change}
                autoResize
                className="w-full"
                rows={8}
            />
            <br />
            <br />

            <ProgressBar
                displayValueTemplate={() => `${20 - value.length} more`}
                value={value.length * 5 > 100 ? 100 : value.length * 5}
            />
        </Panel>
    )
}
export const NewUnitShortcuts = () => {
    return (
        <div className="grid grid-cols-2 grid-rows-1 gap-x-4">
            <div className="grid col-span-1">
                <NewNote />
            </div>
            <div className="grid col-span-1">
                <NewResource />
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
                select_profile(0)
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
                />
            ))}
        />
    )
}
export function CustomPaginatorPanel({ title, items, items_per_page = 20 }) {
    var [current_page, set_current_page] = useState(0)

    var first = current_page * 20
    return (
        <Panel
            className="overflow-hidden"
            header={title}
            footer={
                <Paginator
                    first={first}
                    rows={items_per_page}
                    totalRecords={items.length}
                    onPageChange={(e) => set_current_page(e.page)}
                />
            }
            pt={{ content: { style: { height: "70vh", overflow: "scroll" } } }}
        >
            {items.length === 0 && "there is nothing to show."}
            {items.slice(
                current_page * items_per_page,
                current_page * items_per_page + items_per_page
            )}
        </Panel>
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
export function CustomTabMenu() {
    //idk how to name it something not too long
    //its a 2 col layout. left side is a tab menu
    //its options : saved and whatsHappening
    var [tab_menu_index, set_tab_menu_index] = useState(0)
    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            <div className="col-start-1 col-span-2 space-y-2">
                <TabMenu
                    className="rounded"
                    model={["Saved", "Whats Happening"].map((i) => ({
                        label: i,
                    }))}
                    activeIndex={tab_menu_index}
                    onTabChange={(e) => set_tab_menu_index(e.index)}
                />

                {tab_menu_index === 0 ? <Saved /> : <WhatsHappeningWidget />}
            </div>
            <div className="col-start-3 col-span-1 bg-blue-500 rounded "></div>
        </div>
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
                    you have access to ${cache.length} things over the network.
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
