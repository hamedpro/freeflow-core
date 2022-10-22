import { ArrowBackIosRounded } from "@mui/icons-material";

export function ArrowTitle({onClick,title }) {
    return (
        <div className="cursor-pointer flex m-2 space-x-2 items-center w-fit px-1 hover:bg-blue-900 rounded-lg" onClick={onClick}>
            <ArrowBackIosRounded
                className="rounded"
                sx={{ color: "white" }}
                
            />
            <h1 className="text-lg text-white">
                {title}
            </h1>
        </div>
    )
}