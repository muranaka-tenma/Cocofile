// CocoFile - Development Navigation Component
// Simple navigation for testing different screens during development

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigationStore } from "@/store/navigationStore";
import { ThemeToggle } from "@/components/ThemeToggle";

export const DevNavigation: React.FC = () => {
  const { currentScreen, navigateTo } = useNavigationStore();

  return (
    <div className="fixed bottom-4 right-4 bg-card shadow-lg rounded-lg p-3 border border-border z-50">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        Dev Navigation
      </div>
      <div className="mb-2 pb-2 border-b border-border">
        <ThemeToggle variant="button" />
      </div>
      <div className="flex flex-col gap-1">
        <Button
          size="sm"
          variant={currentScreen === "main-search" ? "default" : "outline"}
          onClick={() => navigateTo("main-search")}
        >
          Main Search
        </Button>
        <Button
          size="sm"
          variant={currentScreen === "scan-index" ? "default" : "outline"}
          onClick={() => navigateTo("scan-index")}
        >
          Scan Index
        </Button>
        <Button
          size="sm"
          variant={currentScreen === "settings" ? "default" : "outline"}
          onClick={() => navigateTo("settings")}
        >
          Settings
        </Button>
        <Button
          size="sm"
          variant={currentScreen === "tag-management" ? "default" : "outline"}
          onClick={() => navigateTo("tag-management")}
        >
          Tag Management
        </Button>
        <Button
          size="sm"
          variant={
            currentScreen === "file-organization" ? "default" : "outline"
          }
          onClick={() => navigateTo("file-organization")}
        >
          File Organization
        </Button>
      </div>
    </div>
  );
};
