import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useOffres } from "@/hooks/useOffres";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Bell, PlusCircle, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { offres } = useOffres();
  const { unreadCount } = useNotifications();

  const totalCandidatures = offres.reduce(
    (acc, o) => acc + (o.candidaturesCount || 0),
    0,
  );

  const stats = [
    {
      label: "Offres publiées",
      value: offres.length,
      icon: Briefcase,
      to: "/recruteur/offres",
      color: "text-chart-1 bg-chart-1/10",
    },
    {
      label: "Candidatures reçues",
      value: totalCandidatures,
      icon: Users,
      to: "/recruteur/offres",
      color: "text-chart-2 bg-chart-2/10",
    },
    {
      label: "Notifications",
      value: unreadCount,
      icon: Bell,
      to: "/notifications",
      color: "text-chart-5 bg-chart-5/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bonjour, {user?.prenom} 👋</h1>
        <p className="mt-1 text-muted-foreground">
          Gérez vos offres et candidatures.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <Card className="transition-shadow hover:shadow-lg cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  </div>
                  <div className={`rounded-full p-3 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/recruteur/offres/nouvelle">
              <PlusCircle className="mr-2 h-4 w-4" /> Publier une offre
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/recruteur/offres">
              Gérer mes offres <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/messages">
              Mes messages <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
