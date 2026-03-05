import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryCardProps {
  icon: string;
  name: string;
  description: string;
  clipCount: number;
  folderCount: number;
  slug: string;
  index: number;
}

const CategoryCard = ({ name, description, clipCount, folderCount, slug, index }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group card-shine bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:glow-accent-sm cursor-pointer"
      onClick={() => navigate(`/category/${slug}`)}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Folder className="w-6 h-6 text-primary" />
      </div>

      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground">
        <span className="bg-secondary px-2.5 py-1 rounded-md">{clipCount} cortes</span>
        <span className="bg-secondary px-2.5 py-1 rounded-md">{folderCount} pastas</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-primary">● Disponível</span>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-lg"
        >
          Acessar Pacote
        </Button>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
