import { readFileSync } from "fs";
import { UnifiedHandlerServer } from "./UnifiedHandlerServer.js";
import { transaction } from "./UnifiedHandler_types.js";
import { calc_cache } from "./utils.js";
import path from "path";
var trs: transaction[] = JSON.parse(
	readFileSync("/Users/hamedpro/.pink_rose_data/store.json", "utf-8")
);
console.log(JSON.stringify(calc_cache(trs, 4), undefined, 4));
