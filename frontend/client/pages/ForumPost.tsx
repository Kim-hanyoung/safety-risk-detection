import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ForumPost() {
  const { id } = useParams();
  const [comments, setComments] = useState([
    { id: "c1", author: "Mina", text: "Great point!" },
  ]);
  const [resolved, setResolved] = useState(false);
  const [text, setText] = useState("");

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Post #{id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a mock discussion thread.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={resolved ? "secondary" : "outline"}
              onClick={() => setResolved((v) => !v)}
            >
              {resolved ? "Resolved" : "Mark as Resolved"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-md border p-3">
              <p className="text-sm">
                <strong>{c.author}:</strong> {c.text}
              </p>
            </div>
          ))}
          <Textarea
            rows={3}
            placeholder="Write a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            onClick={() => {
              if (text.trim()) {
                setComments([
                  ...comments,
                  {
                    id: Math.random().toString(36).slice(2),
                    author: "You",
                    text,
                  },
                ]);
                setText("");
              }
            }}
          >
            Reply
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
