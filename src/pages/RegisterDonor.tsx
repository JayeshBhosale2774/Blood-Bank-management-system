import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RegisterDonor = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    contact: "",
    city: "",
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Please enable location access to register as donor");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error("Location is required to register");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to register");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("donors").insert([{
        user_id: user.id,
        name: formData.name,
        age: parseInt(formData.age),
        blood_group: formData.bloodGroup as any,
        contact: formData.contact,
        city: formData.city,
        latitude: location.lat,
        longitude: location.lng,
      }]);

      if (error) throw error;

      toast.success("Registered successfully as a donor!");
      navigate("/find-donors");
    } catch (error: any) {
      toast.error(error.message || "Error registering donor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/find-donors")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Register as Donor</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Donor Registration</CardTitle>
            <CardDescription>Fill in your details to become a blood donor and help save lives</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group *</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleChange("bloodGroup", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                />
              </div>

              {location && (
                <div className="p-3 bg-success/10 text-success rounded-lg text-sm">
                  ✓ Location detected successfully
                </div>
              )}

              {!location && (
                <div className="p-3 bg-warning/10 text-warning rounded-lg text-sm">
                  Waiting for location access...
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !location}>
                {loading ? "Registering..." : "Register as Donor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RegisterDonor;
