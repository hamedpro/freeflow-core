import { Socket } from "socket.io";

export interface thing {
	type: string;
	current_state: any;
}
export type transaction = {
	id: number;
	thing_id: number;
	time: number;
	diff: rdiff.rdiffResult[];
	type: string;
	user_id?: number;
};
export interface meta_lock extends thing {
	type: "meta/lock";
	current_state: {
		is_locked: boolean;
		thing_id: number;
		user_id?: number;
	};
}
export interface meta_privileges extends thing {
	type: "meta/privileges";
	current_state: {
		collaborators_except_owner: "write/read" | "read";
		others: "write/read" | "read";
		for: number /* thing_id of assosiated thing */;
		admin: "read/write" | "read";
	};
}
export interface meta_collaborators extends thing {
	type: "meta/collaborators";
	current_state: {
		value: { user_id: string; is_owner: boolean }[];
		for: number /* thing id of assosiated thing  */;
	};
}
export interface unit_pack extends thing {
	type: "unit/pack";
	current_state: {
		title: string;
		description: string;
		pack_id?: number | null;
	};
}
export interface unit_resource extends thing {
	type: "unit/resource";
	current_state: {
		pack_id?: number | null;
		description: string;
		title: string;
		file_id: number;
	};
}
export interface unit_task extends thing {
	type: "unit/task";
	current_state: {
		linked_notes: number[];
		end_time: number;
		pack_id?: number | null;
		start_time: number;
		title: string;
		category_id?: number | null;
		description: string;
	};
}
export interface unit_event extends thing {
	type: "unit/event";
	current_state: {
		end_time: number;
		start_time: number;
		title: string;
		category_id?: number | null;
	};
}
export interface message extends thing {
	type: "message";
	current_state: {
		text: string;
		unit_context: "packs" | "resources" | "events" | "notes" | "tasks" | "asks";
		unit_id: number;
	};
}
export interface verification_code extends thing {
	type: "verification_code";
	current_state: {
		kind: "email_address" | "mobile";
		value: number;
		user_id: number;
	};
}
export interface unit_ask extends thing {
	type: "unit/ask";
	current_state: {
		question: string;
		pack_id?: null | number;
		mode: "poll" | "multiple_choice" | "text_answer";
		options?: string[];
		correct_option_index?: number;
	};
}
export interface unit_note extends thing {
	type: "unit/note";
	current_state: {
		title: string;
		pack_id?: null | number;
		data: EditorJS.OutputData;
	};
}
export interface user extends thing {
	type: "user";
	current_state: {
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
export interface calendar_category extends thing {
	type: "calendar_category";
	current_state: {
		name: string;
		color: string;
		user_id: number;
	};
}
export interface surface_cache_item {
	thing_id: number;
	thing:
		| meta_lock
		| meta_privileges
		| unit_pack
		| unit_resource
		| unit_task
		| unit_event
		| unit_ask
		| unit_note
		| user
		| meta_collaborators
		| verification_code
		| message
		| calendar_category;
}
export type SurfaceCache = surface_cache_item[];
export interface authenticated_websocket_client {
	socket: Socket;
	user_id: number;
	last_synced_snapshot: number | undefined /*  a transaction_id  */;
}