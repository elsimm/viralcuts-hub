import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, UserPlus, Folder, Package, Pencil, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

const Admin = () => {
  usePageTitle("CortesFlix - Dashboard");
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
      const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: packs = [] } = useQuery({
    queryKey: ["admin-packs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packs").select("*, categories(name, sort_order)").order("sort_order").order("created_at", { ascending: false });
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
      const maxOrder = categories.length > 0 ? Math.max(...categories.map((c: any) => c.sort_order || 0)) + 1 : 0;
      const { error } = await supabase.from("categories").insert({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, "-"),
        description: catDesc,
        sort_order: maxOrder,
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

  const moveCategory = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = categories.findIndex((c: any) => c.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= categories.length) return;
      const current = categories[idx] as any;
      const swap = categories[swapIdx] as any;
      await supabase.from("categories").update({ sort_order: swap.sort_order ?? swapIdx }).eq("id", current.id);
      await supabase.from("categories").update({ sort_order: current.sort_order ?? idx }).eq("id", swap.id);
    },
    onSuccess: () => invalidateAll(),
  });

  // ---- PACK MUTATIONS ----
  const addPack = useMutation({
    mutationFn: async () => {
      const catPacks = packs.filter((p: any) => p.category_id === selectedCatId);
      const maxOrder = catPacks.length > 0 ? Math.max(...catPacks.map((p: any) => p.sort_order || 0)) + 1 : 0;
      const { error } = await supabase.from("packs").insert({
        category_id: selectedCatId,
        name: packName,
        clip_count: parseInt(packClips) || 0,
        drive_link: packLink,
        sort_order: maxOrder,
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

  const movePack = useMutation({
    mutationFn: async ({ id, categoryId, direction }: { id: string; categoryId: string; direction: "up" | "down" }) => {
      const catPacks = packs.filter((p: any) => p.category_id === categoryId);
      const idx = catPacks.findIndex((p: any) => p.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= catPacks.length) return;
      const current = catPacks[idx] as any;
      const swap = catPacks[swapIdx] as any;
      await supabase.from("packs").update({ sort_order: swap.sort_order ?? swapIdx }).eq("id", current.id);
      await supabase.from("packs").update({ sort_order: current.sort_order ?? idx }).eq("id", swap.id);
    },
    onSuccess: () => invalidateAll(),
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

  // Group packs by category
  const packsByCategory = categories.map((cat: any) => ({
    category: cat,
    packs: packs.filter((p: any) => p.category_id === cat.id),
  })).filter((group: any) => group.packs.length > 0 || true);

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
              {categories.map((c: any, idx: number) => (
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
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost" size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            disabled={idx === 0}
                            onClick={() => moveCategory.mutate({ id: c.id, direction: "up" })}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            disabled={idx === categories.length - 1}
                            onClick={() => moveCategory.mutate({ id: c.id, direction: "down" })}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <span className="text-foreground font-medium">{c.name}</span>
                          <span className="text-muted-foreground text-sm ml-2">/{c.slug}</span>
                          {c.description && <span className="text-muted-foreground text-sm ml-2">— {c.description}</span>}
                        </div>
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
                  {categories.map((c: any) => (
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

            {/* Packs grouped by category */}
            {packsByCategory.map((group: any) => (
              <div key={group.category.id} className="space-y-2">
                <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pt-2">
                  <Folder className="w-4 h-4" />
                  Packs de {group.category.name}
                </h3>
                {group.packs.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-6 py-2">Nenhum pack nesta categoria.</p>
                ) : (
                  group.packs.map((p: any, idx: number) => (
                    <div key={p.id} className="bg-card border border-border rounded-xl px-4 py-3 ml-2">
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
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-0.5">
                              <Button
                                variant="ghost" size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                disabled={idx === 0}
                                onClick={() => movePack.mutate({ id: p.id, categoryId: group.category.id, direction: "up" })}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                disabled={idx === group.packs.length - 1}
                                onClick={() => movePack.mutate({ id: p.id, categoryId: group.category.id, direction: "down" })}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                            <div>
                              <span className="text-foreground font-medium">{p.name}</span>
                              <span className="text-muted-foreground text-sm ml-2">• {p.clip_count} clips</span>
                            </div>
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
                  ))
                )}
              </div>
            ))}
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
