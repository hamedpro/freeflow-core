import EditorJS from "@editorjs/editorjs";
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
	user_id?: number;
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
export type meta = {
	type: "meta";
	value:
		| {
				thing_privileges: thing_privileges;
				locks: locks;
				modify_thing_privileges: number /* user_id */;
				thing_id: number;
		  }
		| {
				file_privileges: { read: number[] | "*" };
				modify_privileges: number;
				file_id: number;
		  };
};
export interface unit_pack extends thing_base {
	type: "unit/pack";
	value: {
		title: string;
		description: string;
		pack_id?: number | null;
	};
}
export interface unit_resource extends thing_base {
	type: "unit/resource";
	value: {
		pack_id?: number | null;
		description: string;
		title: string;
		file_id: number;
	};
}
export interface unit_task extends thing_base {
	type: "unit/task";
	value: {
		linked_notes: number[];
		end_time: number;
		pack_id?: number | null;
		start_time: number;
		title: string;
		category_id?: number | null;
		description: string;
	};
}
export interface unit_event extends thing_base {
	type: "unit/event";
	value: {
		end_time: number;
		start_time: number;
		title: string;
		category_id?: number | null;
	};
}
export interface message extends thing_base {
	type: "message";
	value: {
		text: string;
		unit_context: "packs" | "resources" | "events" | "notes" | "tasks" | "asks";
		unit_id: number;
	};
}
export interface verification_code extends thing_base {
	type: "verification_code";
	value: {
		kind: "email_address" | "mobile";
		value: number;
		user_id: number;
	};
}
export interface unit_ask extends thing_base {
	type: "unit/ask";
	value: {
		question: string;
		pack_id?: null | number;
		mode: "poll" | "multiple_choice" | "text_answer";
		options?: string[];
		correct_option_index?: number;
	};
}
export interface unit_note extends thing_base {
	type: "unit/note";
	value: {
		title: string;
		pack_id?: null | number;
		data: EditorJS.OutputData;
	};
}
export interface user extends thing_base {
	type: "user";
	value: {
		mobile?: string | null;
		email_address?: string | null;
		password?: string | null;
		profile_image_file_id?: number | null;
		calendar_type?: "persian" | "arabic" | "english" | null;
		week_starting_day?:
			| "saturday"
			| "sunday"
			| "monday"
			| "tuesday"
			| "wednesday"
			| "thursday"
			| "friday"
			| null;
		language?: "english" | "persian";
		username?: string;
		email_is_verified?: boolean;
		mobile_is_verified?: boolean;
		full_name?: string;
	};
}
export interface calendar_category extends thing_base {
	type: "calendar_category";
	value: {
		name: string;
		color: string;
		user_id: number;
	};
}
export type thing =
	| meta
	| unit_pack
	| unit_resource
	| unit_task
	| unit_event
	| unit_ask
	| unit_note
	| user
	| verification_code
	| message
	| calendar_category;
export interface cache_item {
	thing_id: number;
	thing: thing;
}
export type cache = cache_item[];
export interface authenticated_websocket_client {
	socket: Socket;
	user_id: number;
	last_synced_snapshot: number | undefined /*  a transaction_id  */;
}
