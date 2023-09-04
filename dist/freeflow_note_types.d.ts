import { thing_base, transaction } from "./UnifiedHandler_types";
export interface unit_pack extends thing_base {
    type: "unit/pack";
    value: {
        title: string;
        description: string;
        default_pack_view_id?: null | number;
    };
}
export interface unit_resource extends thing_base {
    type: "unit/resource";
    value: {
        description: string;
        title: string;
        file_id: number;
    };
}
export interface message extends thing_base {
    type: "message";
    value: {
        text: string;
        points_to: number;
    };
}
export type ask_answer = {
    user_id: transaction["user_id"];
    answer_index: number;
} | {
    user_id: transaction["user_id"];
    answer_text: string;
};
export interface unit_ask extends thing_base {
    type: "unit/ask";
    value: {
        question: string;
        question_body: string;
        mode: "poll" | "multiple_choice" | "text_answer";
        options?: string[];
        correct_option_index?: number;
        answers: ask_answer[];
    };
}
export interface unit_note extends thing_base {
    type: "unit/note";
    value: {
        title: string;
        data: EditorJS.OutputData;
    };
}
export interface calendar_category extends thing_base {
    type: "calendar_category";
    value: {
        name: string;
        color: string;
    };
}
