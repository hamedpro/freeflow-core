import { Socket } from "socket.io";
export interface thing_base {
    type: string;
    value: any;
}
export type transaction = {
    id: number;
    thing_id: number;
    time: number;
    diff: rdiff.rdiffResult[];
    user_id: number;
};
export type paths = string[];
export type locks = {
    path: string[];
    value: number | undefined;
}[];
export type thing_privileges = {
    read: number[] | "*";
    write: number[] | "*";
};
export type file_meta_value = {
    file_privileges: {
        read: number[] | "*";
    };
    modify_privileges: number;
    file_id: number;
    file_mime_type: string;
};
export type non_file_meta_value = {
    thing_privileges: thing_privileges;
    locks: locks;
    modify_thing_privileges: number;
    thing_id: number;
    pack_id?: null | number;
    points_to?: number;
};
export type meta<Value> = {
    type: "meta";
    value: Value;
};
export interface verification_code extends thing_base {
    type: "verification_code";
    value: {
        value: number;
        email: string;
    };
}
export interface user_private_data extends thing_base {
    type: "user_private_data";
    value: {
        password?: string | null;
        calendar_type?: "persian" | "english" | null;
        week_starting_day?: "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | null;
        language?: "english" | "persian";
    };
}
export interface user extends thing_base {
    type: "user";
    value: {
        biography: string;
        password: string;
        calendar_type: string;
        week_starting_day: string;
        email_address: string;
        language: string;
        email_is_verified?: boolean;
        profile_image_file_id?: number | null;
        full_name?: string | null;
        watching?: null | number[];
        saved_things?: number[];
    };
}
export type core_thing = meta<non_file_meta_value | file_meta_value> | user | verification_code | user_private_data | thing_base;
export interface cache_item<CustomThing = core_thing> {
    thing_id: number;
    thing: CustomThing;
    its_meta_cache_item?: cache_item<meta<non_file_meta_value>>;
}
export type cache = cache_item[];
export interface websocket_client {
    socket: Socket;
    profiles_seed?: profile_seed[];
    prev_profiles_seed?: profile_seed[];
    cached_transaction_ids: transaction["id"][];
    last_synced_snapshot: number | undefined;
}
export type profile_data = {
    discoverable_for_this_user: transaction["id"][];
};
export type profile_seed = {
    user_id: number;
    jwt?: string;
    is_active: boolean;
    max_depth?: number;
};
export type profile = profile_data & profile_seed;
export type complete_diff = {
    path: string[];
    after: any;
    before: any;
}[];
export type time_travel_snapshot = {
    type: "timestamp";
    value: ReturnType<Date["getTime"]>;
} | {
    type: "transaction_id";
    value: transaction["id"];
} | undefined;
export type env = {
    websocket_api_port: number;
    restful_api_port: number;
    jwt_secret: string;
    email_address: string;
    email_password: string;
    use_https: boolean;
    https_key_path?: string;
    https_cert_path?: string;
};
