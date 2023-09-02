import { env } from "./UnifiedHandler_types";
export declare function sign_jwt(jwt_secret: string, exp_days: number, payload: object): string;
export declare var data_dir_path: string;
export declare var env_file_path: string;
export declare var store_file_path: string;
export declare function env_vars(): env;
