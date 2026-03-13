import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function StatCard({
    title,
    value,
    caption,
}: {
    title: string;
    value: string;
    caption?: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold text-zinc-100">{value}</div>
                {caption ? <p className="mt-2 text-xs text-zinc-500">{caption}</p> : null}
            </CardContent>
        </Card>
    );
}