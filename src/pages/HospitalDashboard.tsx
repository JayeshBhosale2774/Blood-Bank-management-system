import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface BloodStock {
  id: string;
  blood_group: string;
  available_units: number;
  exchange_available: boolean;
}

const HospitalDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bloodBank, setBloodBank] = useState<any>(null);
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  
  const [bankForm, setBankForm] = useState({
    hospitalName: "",
    address: "",
    contact: "",
  });

  const [stockForm, setStockForm] = useState({
    bloodGroup: "",
    availableUnits: "",
    exchangeAvailable: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (profile && profile.role !== "hospital") {
      navigate("/home");
      toast.error("Access denied. Hospital role required.");
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBloodBank();
    }
  }, [user]);

  const fetchBloodBank = async () => {
    try {
      const { data: bankData, error: bankError } = await supabase
        .from("blood_banks")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (bankError && bankError.code !== "PGRST116") throw bankError;

      if (bankData) {
        setBloodBank(bankData);
        fetchBloodStock(bankData.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching blood bank");
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodStock = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from("blood_stock")
        .select("*")
        .eq("blood_bank_id", bankId);

      if (error) throw error;
      setBloodStock(data || []);
    } catch (error: any) {
      toast.error(error.message || "Error fetching blood stock");
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data, error } = await supabase.from("blood_banks").insert({
            user_id: user!.id,
            hospital_name: bankForm.hospitalName,
            address: bankForm.address,
            contact: bankForm.contact,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }).select().single();

          if (error) throw error;

          setBloodBank(data);
          setShowAddBank(false);
          toast.success("Blood bank registered successfully!");
        } catch (error: any) {
          toast.error(error.message || "Error creating blood bank");
        }
      },
      (error) => {
        toast.error("Please enable location access");
      }
    );
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bloodBank) return;

    try {
      const { error } = await supabase.from("blood_stock").insert([{
        blood_bank_id: bloodBank.id,
        blood_group: stockForm.bloodGroup as any,
        available_units: parseInt(stockForm.availableUnits),
        exchange_available: stockForm.exchangeAvailable,
      }]);

      if (error) throw error;

      await fetchBloodStock(bloodBank.id);
      setShowAddStock(false);
      setStockForm({ bloodGroup: "", availableUnits: "", exchangeAvailable: false });
      toast.success("Blood stock added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error adding blood stock");
    }
  };

  const handleUpdateStock = async (stockId: string, units: number, exchange: boolean) => {
    try {
      const { error } = await supabase
        .from("blood_stock")
        .update({ available_units: units, exchange_available: exchange })
        .eq("id", stockId);

      if (error) throw error;

      await fetchBloodStock(bloodBank.id);
      toast.success("Stock updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating stock");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bloodBank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        <header className="border-b bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Hospital Dashboard</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Register Your Blood Bank</CardTitle>
              <CardDescription>Set up your hospital's blood bank profile to start managing inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBank} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name *</Label>
                  <Input
                    id="hospitalName"
                    placeholder="City General Hospital"
                    value={bankForm.hospitalName}
                    onChange={(e) => setBankForm({ ...bankForm, hospitalName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State"
                    value={bankForm.address}
                    onChange={(e) => setBankForm({ ...bankForm, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={bankForm.contact}
                    onChange={(e) => setBankForm({ ...bankForm, contact: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Register Blood Bank</Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Hospital Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {bloodBank.hospital_name}
            </CardTitle>
            <CardDescription>{bloodBank.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Contact: {bloodBank.contact}</p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Blood Stock Inventory</h2>
          <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Blood Stock</DialogTitle>
                <DialogDescription>Add a new blood group to your inventory</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={stockForm.bloodGroup} onValueChange={(value) => setStockForm({ ...stockForm, bloodGroup: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.filter(g => !bloodStock.some(s => s.blood_group === g)).map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Available Units</Label>
                  <Input
                    type="number"
                    min="0"
                    value={stockForm.availableUnits}
                    onChange={(e) => setStockForm({ ...stockForm, availableUnits: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={stockForm.exchangeAvailable}
                    onCheckedChange={(checked) => setStockForm({ ...stockForm, exchangeAvailable: checked })}
                  />
                  <Label>Exchange Available</Label>
                </div>
                <Button type="submit" className="w-full">Add Stock</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bloodStock.map((stock) => (
            <Card key={stock.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">{stock.blood_group}</span>
                  {stock.exchange_available && <Badge variant="secondary">Exchange</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Units</Label>
                  <Input
                    type="number"
                    min="0"
                    value={stock.available_units}
                    onChange={(e) => handleUpdateStock(stock.id, parseInt(e.target.value), stock.exchange_available)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={stock.exchange_available}
                    onCheckedChange={(checked) => handleUpdateStock(stock.id, stock.available_units, checked)}
                  />
                  <Label className="text-sm">Exchange Available</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bloodStock.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No blood stock added yet</p>
            <Button onClick={() => setShowAddStock(true)}>Add Your First Stock</Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default HospitalDashboard;
