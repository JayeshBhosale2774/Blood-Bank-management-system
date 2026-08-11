import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Award, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  id: string;
  certificate_type: string;
  certificate_number: string;
  issued_date: string;
  donation_count: number;
  blood_group: string | null;
}

const Certificates = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchCertificates();
    }
  }, [user, authLoading, navigate]);

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_date", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: any) {
      toast.error("Error loading certificates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    toast.info("Certificate download feature coming soon!");
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
          <h1 className="text-xl font-bold">My Certificates</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Your Donation Certificates</h2>
          <p className="text-muted-foreground">
            Recognition for your life-saving contributions
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No certificates yet. Start donating to earn certificates!
              </p>
              <Button onClick={() => navigate("/find-blood-banks")}>
                Find Blood Banks
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="p-3 bg-primary/10 rounded-full w-fit">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl capitalize">
                          {cert.certificate_type} Certificate
                        </CardTitle>
                        <CardDescription>
                          Certificate No: {cert.certificate_number}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(cert)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Issued Date</p>
                      <p className="font-medium">
                        {new Date(cert.issued_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Donations</p>
                      <p className="font-medium">{cert.donation_count}</p>
                    </div>
                    {cert.blood_group && (
                      <div>
                        <p className="text-muted-foreground">Blood Group</p>
                        <p className="font-medium">{cert.blood_group}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;
