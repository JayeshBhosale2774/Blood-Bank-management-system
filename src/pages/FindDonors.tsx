import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, ArrowLeft, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DonorMap from "@/components/DonorMap";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

const FindDonors = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchDonors();
    }
  }, [userLocation]);

  useEffect(() => {
    filterDonors();
  }, [donors, bloodGroupFilter, searchQuery]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Please enable location access to find nearby donors");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("available", true);

      if (error) throw error;

      if (userLocation && data) {
        const donorsWithDistance = data
          .map((donor) => ({
            ...donor,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(donor.latitude.toString()),
              parseFloat(donor.longitude.toString())
            ),
          }))
          .filter((donor) => donor.distance && donor.distance <= 5)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setDonors(donorsWithDistance);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching donors");
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = donors;

    if (bloodGroupFilter !== "all") {
      filtered = filtered.filter((donor) => donor.blood_group === bloodGroupFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (donor) =>
          donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          donor.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Find Blood Donors</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood Groups</SelectItem>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/register-donor")}>Register as Donor</Button>
        </div>

        {userLocation && (
          <div className="mb-6">
            <DonorMap donors={filteredDonors} userLocation={userLocation} />
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {filteredDonors.length} donor(s) found within 5 km
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {donor.name}
                  </span>
                  <span className="text-2xl font-bold text-primary">{donor.blood_group}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{donor.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{donor.city}</span>
                </div>
                {donor.distance && (
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium">
                      {donor.distance.toFixed(2)} km away
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDonors.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No donors found matching your criteria.</p>
            <Button className="mt-4" onClick={() => navigate("/register-donor")}>
              Be the first donor in your area
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FindDonors;
