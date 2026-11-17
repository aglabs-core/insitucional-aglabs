import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export interface ReadStats {
  post_id: string;
  month_reads: number;
  comments: number;
}
export function useBlogStats() {
  const [stats, setStats] = useState<ReadStats[]>([]);
  useEffect(() => {
    let active = true;
    supabase.rpc("blog_read_stats").then(({ data, error }) => {
      if (active && !error) setStats(data ?? []);
    });
    return () => {
      active = false;
    };
  }, []);
  return stats;
}
// Counts qualified sessions, not people. No cookie, IP, fingerprint, or account.
export function useTrackRead(postId?: string) {
  useEffect(() => {
    if (!postId || /bot|crawler|spider/i.test(navigator.userAgent)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      timer = setTimeout(() => {
        try {
          const key = "ag-blog-session";
          let session = sessionStorage.getItem(key);
          if (!session) {
            session = crypto.randomUUID();
            sessionStorage.setItem(key, session);
          }
          const day = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Sao_Paulo",
          }).format(new Date());
          const seen = `ag-blog-read:${postId}:${day}`;
          if (sessionStorage.getItem(seen)) return;
          supabase
            .rpc("record_blog_read", {
              p_post_id: postId,
              p_session_id: session,
            })
            .then(({ error }) => {
              if (!error) sessionStorage.setItem(seen, "1");
            });
        } catch {
          /* Storage blocked: skip measurement, keep reading available. */
        }
      }, 10000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [postId]);
}
