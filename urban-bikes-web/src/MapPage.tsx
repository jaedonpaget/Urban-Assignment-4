import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useStations, useLatest, useRecommendations, useTrail } from "./useFirebaseData";

type Props = { sessionId: string };

function colourForBikes(b: number) {
  if (b <= 2) return "#d7191c";   // red
  if (b <= 7) return "#fdae61";   // amber
  return "#1a9641";               // green
}

export default function MapPage({ sessionId }: Props) {
  const stations = useStations();
  const latest = useLatest(sessionId);
  const recs = useRecommendations(sessionId);
  const trail = useTrail(sessionId);

  const userLatLng = latest ? [latest.lat, latest.lon] as [number, number] : undefined;

  const lineCoords = useMemo(
    () => trail.map((p: any) => [p.latitude, p.longitude]) as [number, number][],
    [trail]
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={userLatLng || [53.3498, -6.2603]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stations.map((s: any, i: number) => {
            const lat = s.lat, lon = s.lon;
            if (lat == null || lon == null) return null;
            const bikes = s.availablebikes ?? 0;
            const color = colourForBikes(bikes);
            return (
              <CircleMarker key={i} center={[lat, lon]} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}>
                <Popup>
                  <div>
                    <div>{s.name}</div>
                    <div>Bikes: {bikes}</div>
                    <div>Stands: {s.availablestands ?? 0}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {userLatLng && (
            <>
              <Marker position={userLatLng}>
                <Popup>Your location</Popup>
              </Marker>
              {lineCoords.length >= 2 && (
                <Polyline positions={lineCoords} pathOptions={{ color: "#3366ff", weight: 3 }} />
              )}
            </>
          )}
        </MapContainer>

        {latest && (
          <div style={{
            position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.75)",
            color: "white", padding: "10px 12px", borderRadius: 8, maxWidth: 360
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Nearest: {latest.nearest_station_name} · {Math.round(latest.nearest_dist_m)} m · {Math.round(latest.nearest_walk_eta_s/60)} min
            </div>
            <div>
              Bikes: {latest.nearest_bikes} · Stands: {latest.nearest_stands} · Risk: {latest.risk_flag}
            </div>
          </div>
        )}
      </div>

      <div style={{ width: 360, borderLeft: "1px solid #eee", padding: 12, overflowY: "auto" }}>
        <h3>Alternatives</h3>
        {recs.length === 0 && <div>No nearby alternatives yet.</div>}
        {recs.map((r: any, idx: number) => (
          <div key={idx} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div>{Math.round(r.distance_m)} m · {Math.round(r.walk_eta_s/60)} min walk</div>
            <div>Bikes: {r.available_bikes} · Stands: {r.available_stands}</div>
            <div>Score: {r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
