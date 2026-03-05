import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, UserPlus, Folder, Package, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "packs" | "users">("categories");

  // Category form
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Category edit
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  // Pack form
  const [selectedCatId, setSelectedCatId] = useState("");
  const [packName, setPackName] = useState("");
  const [packClips, setPackClips] = useState("");
  const [packLink, setPackLink] = useState("");

  // Pack edit
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [editPackName, setEditPackName] = useState("");
  const [editPackClips, setEditPackClips] = useState("");
  const [editPackLink, setEditPackLink] = useState("");

  // User form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: packs = [] } = useQuery({
    queryKey: ["admin-packs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packs").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_credentials").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-packs"] });
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // ---- CATEGORY MUTATIONS ----
  const addCategory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").insert({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, "-"),
        description: catDesc,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Categoria criada!" });
      setCatName(""); setCatSlug(""); setCatDesc("");
      invalidateAll();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").update({
        name: editCatName,
        slug: editCatSlug,
        description: editCatDesc,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Categoria atualizada!" });
      setEditingCatId(null);
      invalidateAll();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Categoria removida" }); invalidateAll(); },
  });

  // ---- PACK MUTATIONS ----
  const addPack = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("packs").insert({
        category_id: selectedCatId,
        name: packName,
        clip_count: parseInt(packClips) || 0,
        drive_link: packLink,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Pack adicionado!" });
      setPackName(""); setPackClips(""); setPackLink("");
      invalidateAll();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updatePack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packs").update({
        name: editPackName,
        clip_count: parseInt(editPackClips) || 0,
        drive_link: editPackLink,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Pack atualizado!" });
      setEditingPackId(null);
      invalidateAll();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deletePack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Pack removido" }); invalidateAll(); },
  });

  // ---- USER MUTATIONS ----
  const createUser = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-create-user", {
        body: { email: `${newUsername}@cortesflix.com`, password: newPassword, username: newUsername },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
    },
    onSuccess: () => {
      toast({ title: "Usuário criado!" });
      setNewUsername(""); setNewPassword("");
      invalidateAll();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_credentials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Usuário removido da lista" }); invalidateAll(); },
  });

  const startEditCat = (c: any) => {
    setEditingCatId(c.id);
    setEditCatName(c.name);
    setEditCatSlug(c.slug);
    setEditCatDesc(c.description);
  };

  const startEditPack = (p: any) => {
    setEditingPackId(p.id);
    setEditPackName(p.name);
    setEditPackClips(String(p.clip_count));
    setEditPackLink(p.drive_link);
  };

  const tabs = [
    { key: "categories" as const, label: "Categorias", icon: Folder },
    { key: "packs" as const, label: "Packs", icon: Package },
    { key: "users" as const, label: "Usuários", icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-8">Painel Admin</h1>

        <div className="flex gap-2 mb-8">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={activeTab === t.key ? "default" : "secondary"}
              onClick={() => setActiveTab(t.key)}
              size="sm"
            >
              <t.icon className="w-4 h-4 mr-1.5" />
              {t.label}
            </Button>
          ))}
        </div>

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Nova Categoria</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Nome" value={catName} onChange={(e) => setCatName(e.target.value)} className="bg-secondary border-border text-foreground" />
                <Input placeholder="Slug (auto)" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} className="bg-secondary border-border text-foreground" />
                <Input placeholder="Descrição" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
              <Button onClick={() => addCategory.mutate()} disabled={!catName} className="mt-3" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl px-4 py-3">
                  {editingCatId === c.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="bg-secondary border-border text-foreground" placeholder="Nome" />
                        <Input value={editCatSlug} onChange={(e) => setEditCatSlug(e.target.value)} className="bg-secondary border-border text-foreground" placeholder="Slug" />
                        <Input value={editCatDesc} onChange={(e) => setEditCatDesc(e.target.value)} className="bg-secondary border-border text-foreground" placeholder="Descrição" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateCategory.mutate(c.id)}>
                          <Check className="w-4 h-4 mr-1" /> Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCatId(null)}>
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-foreground font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-sm ml-2">/{c.slug}</span>
                        {c.description && <span className="text-muted-foreground text-sm ml-2">— {c.description}</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEditCat(c)} className="text-muted-foreground hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(c.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PACKS TAB */}
        {activeTab === "packs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Novo Pack</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="h-10 rounded-md border border-border bg-secondary px-3 text-foreground text-sm"
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Input placeholder="Nome do pack" value={packName} onChange={(e) => setPackName(e.target.value)} className="bg-secondary border-border text-foreground" />
                <Input placeholder="Qtd. de clips" type="number" value={packClips} onChange={(e) => setPackClips(e.target.value)} className="bg-secondary border-border text-foreground" />
                <Input placeholder="Link do Drive" value={packLink} onChange={(e) => setPackLink(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
              <Button onClick={() => addPack.mutate()} disabled={!selectedCatId || !packName} className="mt-3" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Adicionar Pack
              </Button>
            </div>

            <div className="space-y-2">
              {packs.map((p: any) => (
                <div key={p.id} className="bg-card border border-border rounded-xl px-4 py-3">
                  {editingPackId === p.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input value={editPackName} onChange={(e) => setEditPackName(e.target.value)} className="bg-secondary border-border text-foreground" placeholder="Nome" />
                        <Input value={editPackClips} onChange={(e) => setEditPackClips(e.target.value)} type="number" className="bg-secondary border-border text-foreground" placeholder="Clips" />
                        <Input value={editPackLink} onChange={(e) => setEditPackLink(e.target.value)} className="bg-secondary border-border text-foreground" placeholder="Link Drive" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updatePack.mutate(p.id)}>
                          <Check className="w-4 h-4 mr-1" /> Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingPackId(null)}>
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-foreground font-medium">{p.name}</span>
                        <span className="text-muted-foreground text-sm ml-2">• {p.categories?.name} • {p.clip_count} clips</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEditPack(p)} className="text-muted-foreground hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePack.mutate(p.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Criar Usuário</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Usuário" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-secondary border-border text-foreground" />
                <Input placeholder="Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
              <Button onClick={() => createUser.mutate()} disabled={!newUsername || !newPassword} className="mt-3" size="sm">
                <UserPlus className="w-4 h-4 mr-1" /> Criar Usuário
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Usuários cadastrados</h3>
              {users.map((u: any) => (
                <div key={u.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-foreground font-medium">{u.username}</span>
                    <span className="text-muted-foreground text-sm font-mono bg-secondary px-2 py-0.5 rounded">{u.password_plain}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteUser.mutate(u.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum usuário cadastrado ainda.</p>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;
