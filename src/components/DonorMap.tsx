import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  contact: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface DonorMapProps {
  donors: Donor[];
  userLocation: { lat: number; lng: number };
}

const DonorMap = ({ donors, userLocation }: DonorMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lng], 12);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: '<div style="background: #DC2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>Your Location</strong>");

    // Add circle for 5km radius
    L.circle([userLocation.lat, userLocation.lng], {
      color: "#DC2626",
      fillColor: "#DC2626",
      fillOpacity: 0.1,
      radius: 5000,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing donor markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && !(layer.getIcon() as any).options.className?.includes("custom-user-marker")) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add donor markers
    const donorIcon = L.divIcon({
      className: "custom-donor-marker",
      html: '<div style="background: #0EA5E9; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    donors.forEach((donor) => {
      L.marker([parseFloat(donor.latitude.toString()), parseFloat(donor.longitude.toString())], {
        icon: donorIcon,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<strong>${donor.name}</strong><br/>
          Blood Group: ${donor.blood_group}<br/>
          City: ${donor.city}<br/>
          Contact: ${donor.contact}<br/>
          Distance: ${donor.distance?.toFixed(2)} km`
        );
    });
  }, [donors]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-[400px]" />
    </Card>
  );
};

export default DonorMap;
