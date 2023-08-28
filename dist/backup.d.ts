import { thing, transaction } from "./UnifiedHandler_types";
export declare function export_backup({ included_files, all_transactions, initial_values, user_id, }: {
    included_files: number[];
    all_transactions: transaction[];
    initial_values: thing[];
    user_id: number;
}): Promise<string>;
