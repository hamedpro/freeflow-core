import express from "express";
import nodemailer from "nodemailer";
import AsyncLock from "async-lock";
import { Socket } from "socket.io";
import { profile, profile_seed, thing, transaction, verification_code, websocket_client } from "./UnifiedHandler_types.js";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore.js";
export declare class UnifiedHandlerServer extends UnifiedHandlerCore {
    websocket_clients: websocket_client[];
    restful_express_app: express.Express;
    jwt_secret: string;
    websocket_api_port: number;
    restful_api_port: number;
    frontend_endpoint: string;
    lock: AsyncLock;
    smtp_transport: ReturnType<typeof nodemailer.createTransport>;
    gen_lock_safe_request_handler: (func: (response: any, reject: any) => any) => (request: any, response: any) => Promise<unknown>;
    get absolute_paths(): {
        data_dir: string;
        uploads_dir: string;
        store_file: string;
        env_file: string;
    };
    constructor();
    new_verf_code(email: string): number;
    new_user(email_address: string): number;
    new_transaction<ThingType extends thing, ThingId extends number | undefined>({ new_thing_creator, thing_id, user_id, }: {
        new_thing_creator: (current_thing: any) => any;
        thing_id: ThingId;
        user_id: number;
    }): number;
    calc_profile(profile_seed: profile_seed, transaction_limit: number | undefined): profile;
    verify_email_ownership(email_address: string, verf_code: verification_code["value"]["value"]): boolean;
    calc_all_discoverable_transactions(profiles: profile[]): transaction[];
    sync_websocket_client(websocket_client: websocket_client): void;
    add_socket(socket: Socket): void;
}
