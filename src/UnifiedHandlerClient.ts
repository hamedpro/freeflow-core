import { io } from "socket.io-client"
import axios from "axios"
import rdiff from "recursive-diff"
import { UnifiedHandlerCore } from "./UnifiedHandlerCore"
import {
    cache_item,
    meta,
    non_file_meta_value,
    profile,
    profile_seed,
    thing,
    transaction,
    unit_ask,
    user,
} from "./UnifiedHandler_types"
import { useNavigate } from "react-router-dom"
import { OutputData } from "@editorjs/editorjs/types/data-formats"
import { getRandomSubarray } from "./utils"
import { custom_find_unique } from "../common_helpers"
var { applyDiff } = rdiff

export class UnifiedHandlerClient extends UnifiedHandlerCore {
    websocket: ReturnType<typeof io>
    websocket_api_endpoint: string
    restful_api_endpoint: string
    profiles_seed: profile_seed[] = []
    profiles: profile[] = []
    strings: (Function | string)[]
    // these are union of all profiles
    all_transactions: transaction[] = []

    constructor(
        websocket_api_endpoint: string,
        restful_api_endpoint: string,
        onChange: () => void | undefined,
        strings: (Function | string)[]
    ) {
        super()
        this.strings = strings
        if (onChange !== undefined) {
            this.onChange = onChange
        }

        this.websocket_api_endpoint = websocket_api_endpoint
        this.restful_api_endpoint = restful_api_endpoint
        //console.log("a new uhclient is created ");

        this.websocket = io(websocket_api_endpoint)
        this.websocket.on("sync_profiles", (diff: rdiff.rdiffResult[]) => {
            //console.log()
            applyDiff(this.profiles, diff)
            this.update_transactions()
        })
        this.websocket.on("sync_all_transactions", (new_transactions) => {
            this.all_transactions = custom_find_unique(
                this.all_transactions.concat(new_transactions),
                (tr1: transaction, tr2: transaction) => tr1.id === tr2.id
            )
            this.update_transactions()
        })
    }
    update_transactions() {
        this.transactions = this.all_transactions.filter((tr) => {
            return (
                this.active_profile &&
                this.active_profile.discoverable_for_this_user.includes(tr.id)
            )
        })
        this.onChange()
    }

    get active_profile() {
        return this.profiles.find((profile) => profile.is_active === true)
    }
    get jwt() {
        return this.active_profile_seed?.jwt
    }
    get active_profile_seed() {
        return this.profiles_seed.find((profile) => profile.is_active)
    }
    get user_id() {
        return this.active_profile_seed?.user_id || 0
    }
    get configured_axios(): ReturnType<typeof axios.create> {
        return axios.create({
            baseURL: this.restful_api_endpoint,
            headers: {
                ...(this.jwt === undefined ? {} : { jwt: this.jwt }),
            },
        })
    }
    async sync_cache() {
        return new Promise<void>((resolve) => {
            this.websocket.emit(
                "sync_cache",
                this.all_transactions.map((tr) => tr.id),
                resolve
            )
        })
    }
    sync_profiles_seed() {
        this.websocket.emit("sync_profiles_seed", this.profiles_seed)
    }

    request_new_transaction = async ({
        new_thing_creator,
        thing_id,
        diff,
    }: {
        thing_id: undefined | number
        new_thing_creator?: (current_thing: any) => any
        diff?: rdiff.rdiffResult[]
    }) => {
        if (
            (new_thing_creator === undefined && diff === undefined) ||
            (new_thing_creator !== undefined && diff !== undefined)
        ) {
            throw "only one of these must be not undefined : `new_thing_creator` or `diff`"
        }

        var data: any = { thing_id }
        if (new_thing_creator === undefined && diff !== undefined) {
            data.diff = diff
        }
        if (diff === undefined && new_thing_creator !== undefined) {
            var thing =
                thing_id === undefined
                    ? {}
                    : this.unresolved_cache.filter(
                          (i) => i.thing_id === thing_id
                      )[0].thing
            data.diff = rdiff.getDiff(
                thing,
                new_thing_creator(JSON.parse(JSON.stringify(thing)))
            )
        }

        var response = await this.configured_axios({
            data,
            method: "post",
            url: "/new_transaction",
        })
        return response.data
    }
    async submit_new_resource({
        file,
        description,
        title,
        create_more,
        nav,
        thing_privileges,
        pack_id,
    }: {
        file: File
        description: string
        title: string
        create_more: boolean
        nav: ReturnType<typeof useNavigate>
        thing_privileges: non_file_meta_value["thing_privileges"]
        pack_id: non_file_meta_value["pack_id"]
    }) {
        if (!file) {
            alert(this.strings[204])
            return
        }
        var f = new FormData()
        f.append("file", file)
        var { new_file_id, meta_id_of_file } = (
            await this.configured_axios({
                data: f,
                url: "/files",
                method: "post",
            })
        ).data
        var new_resource_id = await this.request_new_transaction({
            new_thing_creator: () => ({
                type: "unit/resource",
                value: {
                    description,
                    title,
                    file_id: new_file_id,
                },
            }),
            thing_id: undefined,
        })
        var new_meta_id = await this.request_new_transaction({
            new_thing_creator: () => ({
                type: "meta",
                value: {
                    thing_privileges,
                    modify_thing_privileges: this.user_id,
                    locks: [],
                    thing_id: new_resource_id,
                    pack_id,
                },
            }),
            thing_id: undefined,
        })
        //now lets update file_privileges of that file's meta
        //from now its a link to thing_privileges of meta of this resource
        await this.request_new_transaction({
            diff: [
                {
                    op: "update",
                    path: ["value", "file_privileges", "read"],
                    val: `$$ref::${new_meta_id}:value/thing_privileges/read`,
                },
            ],
            thing_id: meta_id_of_file,
        })

        alert(
            `all done! new file with id = ${new_file_id} is now linked to this new resource : ${new_resource_id}`
        )
        if (!create_more) {
            nav(`/${new_resource_id}`)
        }
    }
    async bootstrap_a_writing({
        text,
        nav,
    }: {
        text: string
        nav: ReturnType<typeof useNavigate>
    }): Promise<number> {
        var data: OutputData = {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text,
                    },
                },
            ],
        }

        //create the note itself
        var new_note_id = await this.request_new_transaction({
            new_thing_creator: () => ({
                type: "unit/note",
                value: {
                    data,
                    title: "bootstraped note",
                },
            }),
            thing_id: undefined,
        })

        //create its meta
        await this.request_new_transaction({
            new_thing_creator: () => ({
                type: "meta",
                value: {
                    thing_privileges: {
                        read: [this.user_id],
                        write: [this.user_id],
                    },
                    modify_thing_privileges: this.user_id,
                    thing_id: new_note_id,
                    locks: [],
                },
            }),
            thing_id: undefined,
        })

        //continue with this new created note
        return new_note_id
    }
    async bootstrap_a_pack({
        title,
        callback,
    }: {
        title: string
        callback: (id_of_new_pack: number) => void
    }) {
        var id_of_new_pack = await this.request_new_transaction({
            new_thing_creator: () => ({
                type: "unit/pack",
                value: {
                    title,
                    description: "this pack was bootstraped",
                },
            }),
            thing_id: undefined,
        })
        await this.request_new_transaction({
            new_thing_creator: (): meta<non_file_meta_value> => ({
                type: "meta",
                value: {
                    thing_privileges: {
                        write: [this.user_id],
                        read: [this.user_id],
                    },
                    modify_thing_privileges: this.user_id,
                    locks: [],
                    thing_id: id_of_new_pack,
                },
            }),
            thing_id: undefined,
        })
        callback(id_of_new_pack)
    }
    async bootstrap_an_ask(
        value: unit_ask["value"],
        callback: (id_of_new_ask: number) => void
    ) {
        var id_of_new_ask = await this.request_new_transaction({
            new_thing_creator: () => ({
                type: "unit/ask",
                value,
            }),
            thing_id: undefined,
        })
        await this.request_new_transaction({
            new_thing_creator: (): meta<non_file_meta_value> => ({
                type: "meta",
                value: {
                    thing_privileges: {
                        write: [this.user_id],
                        read: [this.user_id],
                    },
                    modify_thing_privileges: this.user_id,
                    locks: [],
                    thing_id: id_of_new_ask,
                },
            }),
            thing_id: undefined,
        })
        callback(id_of_new_ask)
    }
    recommend_to_me(): number[] {
        /* returns discoverable thing_ids sorted
        for this user. 
        sorted by how its likely to be liked by the user */

        //its planned to be done
        //track github repo
        return getRandomSubarray(
            this.cache.map((ci) => ci.thing_id),
            this.cache.length
        )
    }
    calc_reputations(): number[] {
        /* returns discoverable thing_ids sorted
        from more important to less  */

        //its planned to be done
        //track github issues
        return getRandomSubarray(
            this.cache.map((ci) => ci.thing_id),
            this.cache.length
        )
    }
    get user(): cache_item<user> | undefined {
        var tmp = this.cache.find((ci) => ci.thing_id === this.user_id)
        function is_user(
            cache_item: cache_item<thing> | undefined
        ): cache_item is cache_item<user> {
            if (cache_item) {
                return cache_item.thing.type === "user"
            } else {
                return false
            }
        }
        if (is_user(tmp)) {
            return tmp
        } else {
            return undefined
        }
    }
    get things_i_watch(): number[] {
        return this.user?.thing.value.watching || []
    }
}
