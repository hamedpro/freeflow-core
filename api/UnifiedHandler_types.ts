import EditorJS from "@editorjs/editorjs"
import { Socket } from "socket.io"

export interface thing_base {
    type: string
    value: any
}
export type transaction = {
    id: number
    thing_id: number
    time: number
    diff: rdiff.rdiffResult[]
    user_id: number
}
export type paths = string[]
export type locks = {
    path: string[]
    value: number | undefined
}[] /* maybe it only contain existing locks */
export type thing_privileges = {
    read: number[] | "*"
    write: number[] | "*"
}
export type file_meta_value = {
    file_privileges: { read: number[] | "*" }
    modify_privileges: number
    file_id: number
    file_mime_type: string
}
export type non_file_meta_value = {
    thing_privileges: thing_privileges
    locks: locks
    modify_thing_privileges: number /* user_id */
    thing_id: number
    pack_id?: null | number
    points_to?: number
}
export type meta<Value> = {
    type: "meta"
    value: Value
}
export interface unit_pack extends thing_base {
    type: "unit/pack"
    value: {
        title: string
        description: string
        default_pack_view_id?: null | number
    }
}
export interface unit_resource extends thing_base {
    type: "unit/resource"
    value: {
        description: string
        title: string
        file_id: number
    }
}

export interface message extends thing_base {
    type: "message"
    value: {
        text: string
        points_to: number /* thing_id  */
    }
}
export interface verification_code extends thing_base {
    type: "verification_code"
    value: {
        value: number
        email: string
    }
}
export type ask_answer =
    | { user_id: transaction["user_id"]; answer_index: number }
    | { user_id: transaction["user_id"]; answer_text: string }
export interface unit_ask extends thing_base {
    type: "unit/ask"
    value: {
        question: string
        question_body: string
        mode: "poll" | "multiple_choice" | "text_answer"
        options?: string[]
        correct_option_index?: number
        answers: ask_answer[]
    }
}
export interface unit_note extends thing_base {
    type: "unit/note"
    value: {
        title: string
        data: EditorJS.OutputData
    }
}
export interface user_private_data extends thing_base {
    type: "user_private_data"
    value: {
        password?: string | null
        calendar_type?: "persian" | "english" | null
        week_starting_day?:
            | "saturday"
            | "sunday"
            | "monday"
            | "tuesday"
            | "wednesday"
            | "thursday"
            | "friday"
            | null
        language?: "english" | "persian"
    }
}
export interface user extends thing_base {
    type: "user"
    value: {
        biography: string
        password: string /* a ref */
        calendar_type: string /* a ref */
        week_starting_day: string /* a ref */
        email_address: string
        language: string /* a ref */
        email_is_verified?: boolean
        profile_image_file_id?: number | null
        full_name?: string | null
        watching?: null | number[] // an array ofthing ids this user "watches"
        saved_things?: number[] /* a ref */
    }
}
export interface calendar_category extends thing_base {
    type: "calendar_category"
    value: {
        name: string
        color: string
    }
}
export type thing =
    | meta<non_file_meta_value | file_meta_value>
    | unit_pack
    | unit_resource
    | unit_ask
    | unit_note
    | user
    | verification_code
    | message
    | calendar_category
    | user_private_data
export interface cache_item<ThingType> {
    thing_id: number
    thing: ThingType
    its_meta_cache_item?: cache_item<meta<non_file_meta_value>>
}
export type cache = cache_item<thing>[]
export interface websocket_client {
    socket: Socket
    profiles_seed?: profile_seed[]
    prev_profiles_seed?: profile_seed[]
    cached_transaction_ids: transaction["id"][]
    last_synced_snapshot: number | undefined /*  a transaction_id  */
}
export type profile_data = {
    discoverable_for_this_user: transaction["id"][]
}
export type profile_seed = {
    user_id: number
    jwt?: string
    is_active: boolean
    max_depth?: number
}
export type profile = profile_data & profile_seed

export type complete_diff = { path: string[]; after: any; before: any }[]
export type time_travel_snapshot =
    | { type: "timestamp"; value: ReturnType<Date["getTime"]> }
    | { type: "transaction_id"; value: transaction["id"] }
    | undefined
