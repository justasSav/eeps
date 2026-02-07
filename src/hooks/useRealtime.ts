"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Subscribe to realtime changes on a Supabase table.
 * Calls `onUpdate` whenever a matching row is updated.
 */
export function useRealtime(
  table: string,
  filter: { column: string; value: string } | null,
  onUpdate: (payload: Record<string, unknown>) => void
) {
  useEffect(() => {
    if (!filter) return;

    const channel = supabase
      .channel(`${table}-${filter.value}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload) => {
          onUpdate(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onUpdate]);
}
