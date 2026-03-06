import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";

const Dashboard = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Escolha sua categoria
          </h1>
          <p className="text-muted-foreground text-lg">
            Pacotes organizados com cortes prontos para viralizar.
          </p>
        </motion.div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhuma categoria disponível ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                icon={cat.icon_name}
                name={cat.name}
                description={cat.description}
                clipCount={cat.clip_count}
                folderCount={cat.folder_count}
                slug={cat.slug}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
