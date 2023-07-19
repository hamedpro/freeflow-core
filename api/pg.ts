var items: any[] = [1, "2", "3", "4"]
var numbers = items.filter(
    <(x: any) => x is number>((x) => typeof x == "number")
)
numbers
