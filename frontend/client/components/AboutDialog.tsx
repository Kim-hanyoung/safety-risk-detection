import { useRef, useState } from "react";
import { AlertTriangle, Shield, Users, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AboutDialog({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pressTimer = useRef<number | null>(null);

  const startPress = () => {
    pressTimer.current = window.setTimeout(() => setIsOpen(true), 500);
  };
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  };

  const btnPos = inline ? "absolute -bottom-6 right-6" : "fixed top-28 right-8";

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        className={`${btnPos} z-40 bg-yellow-400 hover:bg-yellow-500 text-black shadow-2xl h-16 w-16 rounded-full p-0 border-4 border-yellow-600 hover:scale-110 transition-all duration-300 animate-pulse shake-soft`}
        size="lg"
      >
        <AlertTriangle className="h-8 w-8" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] bg-slate-900/95 backdrop-blur-lg border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-white text-xl">
              <Shield className="h-7 w-7 text-yellow-400" />
              <span>About Industrial Safety Portal</span>
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Your comprehensive safety management solution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
                <Shield className="mb-3 h-10 w-10 text-blue-400" />
                <h3 className="mb-2 font-medium text-white">Safety First</h3>
                <p className="text-sm text-blue-200">
                  Comprehensive incident tracking and prevention
                </p>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
                <Users className="mb-3 h-10 w-10 text-green-400" />
                <h3 className="mb-2 font-medium text-white">Team Safety</h3>
                <p className="text-sm text-blue-200">
                  Protecting every team member, every day
                </p>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
                <Award className="mb-3 h-10 w-10 text-yellow-400" />
                <h3 className="mb-2 font-medium text-white">Excellence</h3>
                <p className="text-sm text-blue-200">
                  Industry-leading safety standards
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h4 className="mb-3 font-medium text-white">Our Mission</h4>
              <p className="leading-relaxed text-blue-200">
                The Industrial Safety Portal provides real-time monitoring,
                comprehensive reporting, and proactive safety management tools
                to ensure a secure work environment. Our platform combines
                advanced analytics with user-friendly interfaces to help
                organizations maintain the highest safety standards.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h4 className="mb-3 font-medium text-white">Key Features</h4>
              <ul className="space-y-2 text-blue-200">
                <li>• Real-time incident tracking and reporting</li>
                <li>• Comprehensive safety analytics and trends</li>
                <li>• Compliance monitoring and alerts</li>
                <li>• Employee safety training management</li>
                <li>• Risk assessment and mitigation tools</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
