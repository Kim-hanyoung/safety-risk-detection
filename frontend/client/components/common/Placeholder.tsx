import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Placeholder({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/image-analysis">Try Image Analysis</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
