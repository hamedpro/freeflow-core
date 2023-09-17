export type snapshot = {
    time: number;
    xs: number[];
    ys: number[];
};
export type stats = {
    [stat_title: string]: {
        x_title?: string;
        y_title?: string;
        xs: number[];
        ys: number[];
    };
};
export declare class point {
    identifier: string;
    tmp_timestamp?: number;
    duration?: number;
    perf_profiler: perf_profiler;
    x: number;
    auto_commit: boolean;
    constructor(perf_profiler: perf_profiler, identifier: string, x: number);
    start(): void;
    end(): void;
}
export declare class perf_profiler {
    store_path: string;
    tmp_timestamp: number;
    stats: stats;
    constructor();
    init_new_stat(identifier: string, x_title: string, y_title: string): void;
    commit(): void;
    new_point(identifier: string, x: number): point;
}
