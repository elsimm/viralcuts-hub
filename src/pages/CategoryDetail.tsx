import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Film, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CategoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: packs = [] } = useQuery({
    queryKey: ["packs", category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      const { data, error } = await supabase
        .from("packs")
        .select("*")
        .eq("category_id", category.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoria não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Folder className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </motion.div>

        {packs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum pack disponível nesta categoria ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all hover:glow-accent-sm"
              >
                <div className="h-40 bg-secondary flex items-center justify-center relative">
                  <Film className="w-12 h-12 text-muted-foreground/30" />
                  <div className="absolute bottom-3 right-3 bg-background/80 px-2 py-1 rounded text-xs text-foreground">
                    {pack.clip_count} clips
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                    {pack.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    {pack.clip_count} clips prontos para download
                  </p>

                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    onClick={() => {
                      if (pack.drive_link) {
                        window.open(pack.drive_link, "_blank", "noopener,noreferrer");
                      }
                    }}
                    disabled={!pack.drive_link}
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Acessar Drive
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryDetail;
