import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

const Login = () => {
  usePageTitle("CortesFlix - Login");
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(username, password);
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <Play className="w-10 h-10 text-primary fill-primary" />
            <h1 className="text-5xl font-heading font-bold text-gradient">CortesFlix</h1>
          </div>

          <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
            A maior biblioteca de cortes prontos para viralizar.
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Escolha seu nicho, baixe os cortes e poste nas redes sociais.
          </p>

          <div className="mt-12 flex gap-6">
            {["TikTok", "Instagram", "YouTube"].map((platform) => (
              <div key={platform} className="glass rounded-lg px-4 py-2">
                <span className="text-sm text-muted-foreground">{platform}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Play className="w-8 h-8 text-primary fill-primary" />
            <span className="text-3xl font-heading font-bold text-gradient">CortesFlix</span>
          </div>

          <div className="glass rounded-2xl p-8 glow-accent-sm">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
              Entrar na plataforma
            </h3>
            <p className="text-muted-foreground mb-8">
              Acesse seus pacotes de cortes
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
