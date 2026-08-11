import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BloodBankMap from "@/components/BloodBankMap";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

const FindBloodBanks = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchBloodBanks();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterBloodBanks();
  }, [bloodBanks, bloodGroupFilter, searchQuery]);

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
        }
      );
    }
  };

  const fetchBloodBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("blood_banks")
        .select(`
          *,
          blood_stock (
            blood_group,
            available_units,
            exchange_available
          )
        `);

      if (error) throw error;
      setBloodBanks(data || []);
    } catch (error: any) {
      toast.error(error.message || "Error fetching blood banks");
    } finally {
      setLoading(false);
    }
  };

  const filterBloodBanks = () => {
    let filtered = bloodBanks;

    if (bloodGroupFilter !== "all") {
      filtered = filtered.filter((bank) =>
        bank.blood_stock.some(
          (stock) => stock.blood_group === bloodGroupFilter && stock.available_units > 0
        )
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (bank) =>
          bank.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBanks(filtered);
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
          <h1 className="text-xl font-bold">Find Blood Banks</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by hospital name or address..."
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
        </div>

        {userLocation && (
          <div className="mb-6">
            <BloodBankMap bloodBanks={filteredBanks} userLocation={userLocation} />
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-semibold">{filteredBanks.length} blood bank(s) found</h2>
        </div>

        <div className="grid gap-4">
          {filteredBanks.map((bank) => (
            <Card key={bank.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {bank.hospital_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{bank.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{bank.contact}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Available Blood Stock:</h4>
                  <div className="flex flex-wrap gap-2">
                    {bank.blood_stock.map((stock) => (
                      <Badge
                        key={stock.blood_group}
                        variant={stock.available_units > 0 ? "default" : "secondary"}
                        className="px-3 py-1"
                      >
                        {stock.blood_group}: {stock.available_units} units
                        {stock.exchange_available && " (Exchange ✓)"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBanks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No blood banks found matching your criteria.</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FindBloodBanks;
