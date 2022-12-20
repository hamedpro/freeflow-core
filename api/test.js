var x = [["before", "in"],
				["before", "end"],
				["before", "after"],
				["start", "in"],
				["start", "end"],
				["start", "after"],
				["in", "in"],
				["in", "end"],
    ["in", "after"],]
console.log(x.map(i=>{return {situation : i , bool : true }}))