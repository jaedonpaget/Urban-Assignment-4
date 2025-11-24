import { db, ref, onValue, query, limitToLast } from "./firebase";
import { useEffect, useState } from "react";

export function useStations() {
  const [stations, setStations] = useState<any[]>([]);
  useEffect(() => {
    const r = ref(db, "/opendata/dublin_bikes/items");
    return onValue(r, (snap) => {
      const val = snap.val();
      // items posted with push() -> object; convert to array
      const arr = val ? Object.values(val) : [];
      setStations(arr as any[]);
    });
  }, []);
  return stations;
}

export function useLatest(sessionId: string) {
  const [latest, setLatest] = useState<any | null>(null);
  useEffect(() => {
    const r = ref(db, `/analytics/latest/${sessionId}`);
    return onValue(r, (snap) => {
      // posted with push -> object-of-objects; pick last
      const val = snap.val();
      if (!val) { setLatest(null); return; }
      const arr = Object.values(val) as any[];
      setLatest(arr[arr.length - 1] || null);
    });
  }, [sessionId]);
  return latest;
}

export function useRecommendations(sessionId: string) {
  const [recs, setRecs] = useState<any[]>([]);
  useEffect(() => {
    const r = ref(db, `/analytics/recommendations/${sessionId}`);
    return onValue(r, (snap) => {
      const val = snap.val();
      if (!val) { setRecs([]); return; }
      const arr = Object.values(val) as any[];
      const last = arr[arr.length - 1] as any;
      setRecs((last?.items as any[]) || []);
    });
  }, [sessionId]);
  return recs;
}

export function useTrail(sessionId: string, maxPoints = 500) {
  const [pts, setPts] = useState<any[]>([]);
  useEffect(() => {
    const r = query(ref(db, `/sessions/${sessionId}/points`), limitToLast(maxPoints));
    return onValue(r, (snap) => {
      const val = snap.val();
      const arr = val ? Object.values(val) : [];
      setPts(arr as any[]);
    });
  }, [sessionId, maxPoints]);
  return pts;
}
