import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const categories = ["General", "Near-Miss Reports", "Best Practices", "Q&A"];

export default function Forum() {
  const [active, setActive] = useState("General");
  const [posts, setPosts] = useState([
    {
      id: "1",
      title: "Helmet detection tips",
      category: "Best Practices",
      tags: ["PPE"],
      author: "Mina",
      replies: 4,
      pinned: true,
      starred: true,
      time: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Near-miss on ladder",
      category: "Near-Miss Reports",
      tags: ["Fall"],
      author: "Jin",
      replies: 2,
      pinned: false,
      starred: false,
      time: new Date().toISOString(),
    },
  ]);

  const filtered = useMemo(
    () => posts.filter((p) => p.category === active),
    [posts, active],
  );

  const [draft, setDraft] = useState({
    title: "",
    category: "General",
    body: "",
  });

  return (
    <div className="container mx-auto grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="mt-1 w-full rounded-md border bg-background p-2"
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({ ...draft, category: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Body</Label>
                  <Textarea
                    rows={6}
                    value={draft.body}
                    onChange={(e) =>
                      setDraft({ ...draft, body: e.target.value })
                    }
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Attach image (mock)
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setDraft({ title: "", category: "General", body: "" })
                    }
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      setPosts([
                        {
                          id: Math.random().toString(36).slice(2),
                          title: draft.title || "Untitled",
                          category: draft.category,
                          tags: [],
                          author: "You",
                          replies: 0,
                          pinned: false,
                          starred: true,
                          time: new Date().toISOString(),
                        },
                        ...posts,
                      ]);
                    }}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="mb-3 flex flex-wrap gap-2 p-2">
            {categories.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={active}>
            <div className="space-y-2">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to={`/forum/${p.id}`}
                  className="block rounded-lg border p-3 hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.author} • {new Date(p.time).toLocaleString()} •{" "}
                        {p.replies} replies
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.pinned ? "📌" : ""} {p.starred ? "⭐" : ""}
                    </div>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>Jin — 124 pts</li>
              <li>Mina — 118 pts</li>
              <li>Hana — 95 pts</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Safety Guidelines</CardTitle>
            <CardDescription>Community code of conduct</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Be respectful and constructive.</p>
            <p>• No personal data in posts or images.</p>
            <p>• Tag posts appropriately.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
