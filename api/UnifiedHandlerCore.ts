import cors from "cors";
import formidable from "formidable";
import jwt_module from "jsonwebtoken";
import express from "express";
import EditorJS from "@editorjs/editorjs";
//read README file : UnifiedHandlerSystem.md
import fs, { mkdirSync } from "fs";
import os from "os";
import { fileURLToPath } from "url";
import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;
var unique_items_of_array = (
	array: (string | number)[] //todo : it may not work for array containing anything other than numbers or string
) => array.filter((i, index) => array.indexOf(i) === index) as any;

import { Server, Socket } from "socket.io";
import { io } from "socket.io-client";
import path from "path";
import { pink_rose_export, pink_rose_import } from "./pink_rose_io.js";
import axios from "axios";
import {
	authenticated_websocket_client,
	meta_lock,
	surface_cache_item,
	transaction,
} from "./UnifiedHandler_types.js";
import { exit } from "process";
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}

export class UnifiedHandlerCore {
	discoverable_transactions_onchange: () => void = () => {};

	discoverable_transactions: transaction[] = [];

	check_lock({ user_id, thing_id }: { thing_id: number; user_id: number | undefined }): boolean {
		var lock = this.surface_cache.find((i: surface_cache_item) => {
			return i.thing.type === "meta/lock" && i.thing.current_state.thing_id === thing_id;
		});
		if (lock === undefined) return true;

		function is_meta_lock(a: any): a is meta_lock {
			return (<meta_lock>a).current_state.user_id !== undefined;
		}
		if (is_meta_lock(lock.thing)) {
			if (lock.thing.current_state.is_locked === false) {
				return true;
			} else if (lock.thing.current_state.user_id === user_id) {
				return true;
			}
		}
		return false;
	}

	check_privilege(user_id: number | undefined, thing_id: number, job: "write" | "read"): boolean {
		if (user_id === undefined) return true;
		/* returns whether the user has privilege of doing specified "job" to that thing */
		var privilege_thing = this.surface_cache.find(
			(i: surface_cache_item) =>
				i.thing.type === "meta/privileges" && i.thing.current_state.for === thing_id
		);
		if (privilege_thing === undefined) {
			return true;
		} else {
			var privilege: any = privilege_thing.thing.current_state;
		}

		var collaborators_thing: any = this.surface_cache.find(
			(i: surface_cache_item) =>
				i.thing.type === "meta/collaborators" && i.thing.current_state.for === thing_id
		);

		var collaborators = collaborators_thing.current_state.value;

		var user_thing: any = this.surface_cache.find(
			(i: surface_cache_item) => i.thing.type === "user" && i.thing_id === user_id
		);
		var user = user_thing.current_state;
		/* 	priority of admin privilege on something is higher.
			it means if its said that admin has write access but
			the admin is also a non-owner collaborator and its said
			they have only read access that user can write there.
		*/
		if (user.is_admin === true) {
		}
		if (
			collaborators
				.map((i: { user_id: number; is_owner: boolean }) => i.user_id)
				.includes(user_id)
		) {
			//this user is a collaborator
			if (
				collaborators.find(
					(i: { user_id: number; is_owner: boolean }) => i.user_id === user_id
				).is_owner === true
			) {
				return true;
			} else if (job === "write") {
				return privilege.collaborators_except_owner === "write/read";
			} else if (job === "read") {
				return (
					privilege.collaborators_except_owner === "read" ||
					privilege.collaborators_except_owner === "write/read"
				);
			}
		} else {
			//this user is considered in "others" of this thing
			if (job === "write") {
				return privilege.others === "write/read";
			} else {
				return privilege.others === "write/read" || privilege.others === "read";
			}
		}
		return true;
	}
	calc_surface_cache(time_travel_snapshot: number | undefined) {
		//returns an array which contains a mapping
		// from thing_ids each to its calculated version

		return unique_items_of_array(
			(time_travel_snapshot === undefined
				? this.discoverable_transactions
				: this.discoverable_transactions.filter((i) => i.id <= time_travel_snapshot)
			).map((i) => i.thing_id)
		).map((thing_id: number) => this.calc_thing_state(thing_id));
	}
	get surface_cache(): surface_cache_item[] {
		return this.calc_surface_cache(undefined);
	}

	sorted_transactions_of_thing(thing_id: number) {
		return this.discoverable_transactions
			.filter((transaction) => transaction.thing_id === thing_id)
			.sort((i1, i2) => i1.time - i2.time);
	}
	calc_thing_state(thing_id: number, last_transaction_to_consider = undefined) {
		//if last_transaction_to_consider it will only applies changes until that (to init value (which is {}))
		var state = { thing_id, thing: {} };
		for (var transaction of this.sorted_transactions_of_thing(thing_id)) {
			applyDiff(state.thing, transaction.diff);
			if (
				last_transaction_to_consider !== undefined &&
				last_transaction_to_consider === transaction.id
			) {
				return state;
			}
		}

		return state;
	}
}
