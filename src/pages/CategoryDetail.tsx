import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Eye, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { categories } from "@/data/categories";

const packs = [
  { id: 1, name: "Pack 01", clips: 30 },
  { id: 2, name: "Pack 02", clips: 25 },
  { id: 3, name: "Pack 03", clips: 35 },
];

const CategoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoria não encontrada.</p>
      </div>
    );
  }

  const Icon = category.icon;

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
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all hover:glow-accent-sm"
            >
              {/* Thumbnail area */}
              <div className="h-40 bg-secondary flex items-center justify-center relative">
                <Film className="w-12 h-12 text-muted-foreground/30" />
                <div className="absolute bottom-3 right-3 bg-background/80 px-2 py-1 rounded text-xs text-foreground">
                  {pack.clips} clips
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                  {pack.name} — {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {pack.clips} clips prontos para download
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Ver prévia
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Baixar Pack
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryDetail;
