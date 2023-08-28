import { io } from "socket.io-client";
import axios from "axios";
import rdiff from "recursive-diff";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore";
import { cache_item, non_file_meta_value, profile, profile_seed, transaction, unit_ask, user } from "./UnifiedHandler_types";
import { useNavigate } from "react-router-dom";
export declare class UnifiedHandlerClient extends UnifiedHandlerCore {
    websocket: ReturnType<typeof io>;
    websocket_api_endpoint: string;
    restful_api_endpoint: string;
    profiles_seed: profile_seed[];
    profiles: profile[];
    strings: (Function | string)[];
    all_transactions: transaction[];
    constructor(websocket_api_endpoint: string, restful_api_endpoint: string, onChange: () => void | undefined, strings: (Function | string)[]);
    update_transactions(): void;
    get active_profile(): profile | undefined;
    get jwt(): string | undefined;
    get active_profile_seed(): profile_seed | undefined;
    get user_id(): number;
    get configured_axios(): ReturnType<typeof axios.create>;
    sync_cache(): Promise<void>;
    sync_profiles_seed(): void;
    request_new_transaction: ({ new_thing_creator, thing_id, diff, }: {
        thing_id: undefined | number;
        new_thing_creator?: ((current_thing: any) => any) | undefined;
        diff?: rdiff.rdiffResult[] | undefined;
    }) => Promise<any>;
    submit_new_resource({ file, description, title, create_more, nav, thing_privileges, pack_id, }: {
        file: File;
        description: string;
        title: string;
        create_more: boolean;
        nav: ReturnType<typeof useNavigate>;
        thing_privileges: non_file_meta_value["thing_privileges"];
        pack_id: non_file_meta_value["pack_id"];
    }): Promise<void>;
    bootstrap_a_writing({ text, nav, }: {
        text: string;
        nav: ReturnType<typeof useNavigate>;
    }): Promise<number>;
    bootstrap_a_pack({ title, callback, }: {
        title: string;
        callback: (id_of_new_pack: number) => void;
    }): Promise<void>;
    bootstrap_an_ask(value: unit_ask["value"], callback: (id_of_new_ask: number) => void): Promise<void>;
    recommend_to_me(): number[];
    calc_reputations(): number[];
    get user(): cache_item<user> | undefined;
    get things_i_watch(): number[];
}
