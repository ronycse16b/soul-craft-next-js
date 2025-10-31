"use client";
import React from "react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityList({ items = [] }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-slate-400">No activity</li>
        ) : (
          items.map((it) => (
            <li key={it.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                {it.user?.slice(0, 1) || "U"}
              </div>
              <div className="text-sm">
                <div className="text-slate-700 dark:text-slate-200">
                  {it.text}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(it.time), { addSuffix: true })}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
