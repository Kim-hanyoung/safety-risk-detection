import Placeholder from "@/components/common/Placeholder";
import { LogIn } from "lucide-react";

export default function Auth() {
  return (
    <Placeholder
      title="Login / Sign Up"
      description="Authenticate to access saved reports, alerts, and organization settings. Ask to add tabbed auth with social providers."
      icon={<LogIn className="h-7 w-7 text-primary" />}
    />
  );
}
