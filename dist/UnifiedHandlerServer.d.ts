/// <reference types="node" />
/// <reference types="node" />
import { createServer as https_create_server } from "https";
import { createServer as http_create_server } from "http";
import nodemailer from "nodemailer";
import { cache_item, env, profile, profile_seed, core_thing, transaction, verification_code, websocket_client, time_travel_snapshot } from "./UnifiedHandler_types.js";
import { extract_user_id, new_transaction_privileges_check } from "./utils.js";
export declare class UnifiedHandlerServer {
    websocket_api: ReturnType<typeof https_create_server> | ReturnType<typeof http_create_server>;
    websocket_clients: websocket_client[];
    restful_express_app: ReturnType<typeof https_create_server> | ReturnType<typeof http_create_server>;
    jwt_secret: string;
    use_https: boolean;
    websocket_api_port: number;
    restful_api_port: number;
    https_cert_path: undefined | string;
    https_key_path: undefined | string;
    smtp_transport: ReturnType<typeof nodemailer.createTransport>;
    env: env;
    get absolute_paths(): {
        data_dir: string;
        uploads_dir: string;
        store_file: string;
        env_file: string;
    };
    setup_websoket_api(): import("https").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    setup_rest_api(): import("https").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    constructor();
    time_travel_snapshot: time_travel_snapshot;
    time_travel(snapshot: time_travel_snapshot): void;
    get cache(): cache_item[];
    get unresolved_cache(): import("./UnifiedHandler_types.js").cache;
    new_verf_code(email: string): number;
    new_user(email_address: string): number;
    new_transaction<ThingType extends core_thing, ThingId extends number | undefined>({ new_thing_creator, thing_id, user_id, }: {
        new_thing_creator: (current_thing: any) => any;
        thing_id: ThingId;
        user_id: number;
    }): number;
    calc_profile(profile_seed: profile_seed, transaction_limit: number | undefined): profile;
    verify_email_ownership(email_address: string, verf_code: verification_code["value"]["value"]): boolean;
    calc_all_discoverable_transactions(profiles: profile[]): transaction[];
    sync_websocket_client(websocket_client: websocket_client): void;
    add_socket(socket: websocket_client["socket"]): void;
    calc_user_discoverable_files(user_id: number): number[];
    thing_transactions: (thing_id: number) => transaction[];
    find_first_transaction: (thing_id: number) => transaction;
    calc_user_discoverable_things: (user_id: number) => number[];
    calc_user_discoverable_transactions: (user_id: number) => transaction[];
    find_thing_meta: (thing_id: number) => cache_item<core_thing> | undefined;
    apply_max_sync_depth(transactions: transaction[], max_sync_depth: number | undefined): transaction[];
    new_transaction_privileges_check: typeof new_transaction_privileges_check;
    extract_user_id: typeof extract_user_id;
    onChange: () => void;
    find_user_private_data_id(user_id: number): number;
    transactions: transaction[];
}
