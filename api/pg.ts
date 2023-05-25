import rdiff from "recursive-diff";
var { getDiff, applyDiff } = rdiff;
var state1 = { name: "hamed", cars: ["buggati", "lambo"] };
var state2 = { name: "hamed" };
console.log(getDiff(state1, state2));
