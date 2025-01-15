export interface RouteStep {
    from: number;
    from_name: string | null;
    to: number;
    to_name: string | null;
    line: string | null;
}

export interface DetailedTransfer {
    station_name: string | undefined;
    from_line: string | undefined;
    to_line: string | undefined;
}

export interface BestRoute {
    start_name: string;
    end_name: string;
    totalCost: number;
    route: RouteStep[];
    transfers: DetailedTransfer[];
}
