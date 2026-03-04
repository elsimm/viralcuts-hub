import { motion } from "framer-motion";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const downloadHistory = [
  { id: 1, name: "Pack 01 — Cortes Virais", date: "28 Fev 2026", clips: 30 },
  { id: 2, name: "Pack 02 — Cortes Memes", date: "25 Fev 2026", clips: 25 },
  { id: 3, name: "Pack 01 — Cortes Gaming", date: "20 Fev 2026", clips: 35 },
];

const Downloads = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Meus Downloads
          </h1>
          <p className="text-muted-foreground">Seus pacotes baixados recentemente.</p>
        </motion.div>

        <div className="space-y-4">
          {downloadHistory.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/20 transition-colors"
            >
              <div>
                <h3 className="font-heading font-semibold text-foreground">{item.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                  <span>{item.clips} clips</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Baixar novamente
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Downloads;
