import { Link, useLocation } from "react-router-dom";
import { Play, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Categorias", path: "/dashboard" },
  { label: "Meus Downloads", path: "/downloads" },
  { label: "Minha Conta", path: "/account" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Play className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-heading font-bold text-gradient">CortesFlix</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                className="pl-9 h-9 w-56 bg-secondary border-border text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
