import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface BloodBank {
  id: string;
  hospital_name: string;
  address: string;
  contact: string;
  latitude: number;
  longitude: number;
  blood_stock: Array<{
    blood_group: string;
    available_units: number;
    exchange_available: boolean;
  }>;
}

interface BloodBankMapProps {
  bloodBanks: BloodBank[];
  userLocation: { lat: number; lng: number };
}

const BloodBankMap = ({ bloodBanks, userLocation }: BloodBankMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lng], 10);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: '<div style="background: #DC2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>Your Location</strong>");

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && !(layer.getIcon() as any).options.className?.includes("custom-user-marker")) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const hospitalIcon = L.divIcon({
      className: "custom-hospital-marker",
      html: '<div style="background: #10B981; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">H</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    bloodBanks.forEach((bank) => {
      const stockInfo = bank.blood_stock
        .map((s) => `${s.blood_group}: ${s.available_units} units${s.exchange_available ? " (Exchange)" : ""}`)
        .join("<br/>");

      L.marker([parseFloat(bank.latitude.toString()), parseFloat(bank.longitude.toString())], {
        icon: hospitalIcon,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<strong>${bank.hospital_name}</strong><br/>
          ${bank.address}<br/>
          Contact: ${bank.contact}<br/><br/>
          <strong>Stock:</strong><br/>${stockInfo}`
        );
    });
  }, [bloodBanks]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-[400px]" />
    </Card>
  );
};

export default BloodBankMap;
