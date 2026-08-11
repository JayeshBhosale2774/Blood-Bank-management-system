import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, LogOut, Droplet, Award } from "lucide-react";

const Home = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Droplet className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Blood Bank System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome to Blood Bank</h2>
          <p className="text-muted-foreground text-lg">
            {profile?.role === "hospital"
              ? "Manage your blood bank inventory"
              : "Find donors or blood banks near you"}
          </p>
        </div>

        {profile?.role === "person" ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/find-donors")}>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Find Donors</CardTitle>
                <CardDescription className="text-base">
                  Connect with blood donors near your location within 5 km radius
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Search Nearby Donors</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/find-blood-banks")}>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Find Blood Banks</CardTitle>
                <CardDescription className="text-base">
                  Locate blood banks and hospitals with available blood stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Blood Banks</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/certificates")}>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Certificates</CardTitle>
                <CardDescription className="text-base">
                  View your donation certificates and recognition rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">My Certificates</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Hospital Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Manage your blood bank inventory and view blood requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/hospital-dashboard")}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
