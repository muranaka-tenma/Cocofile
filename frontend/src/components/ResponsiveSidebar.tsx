import * as React from "react";
import {
  Search,
  Settings,
  ScanSearch,
  Tags,
  FolderTree,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigationStore } from "@/store/navigationStore";
import type { Screen } from "@/store/navigationStore";

interface SidebarItem {
  id: Screen;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "main-search",
    label: "検索",
    icon: Search,
    description: "ファイルを検索",
  },
  {
    id: "scan-index",
    label: "スキャン",
    icon: ScanSearch,
    description: "ファイルをインデックス化",
  },
  {
    id: "tag-management",
    label: "タグ管理",
    icon: Tags,
    description: "タグを管理",
  },
  {
    id: "file-organization",
    label: "整理",
    icon: FolderTree,
    description: "ファイルを整理",
  },
  {
    id: "settings",
    label: "設定",
    icon: Settings,
    description: "アプリケーション設定",
  },
];

interface ResponsiveSidebarProps {
  className?: string;
}

export function ResponsiveSidebar({ className }: ResponsiveSidebarProps) {
  const { currentScreen, navigateTo } = useNavigationStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // ESCキーでサイドバーを閉じる
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleItemClick = (screen: Screen) => {
    navigateTo(screen);
    setIsOpen(false);
  };

  return (
    <>
      {/* モバイルメニューボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* オーバーレイ（モバイル） */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r border-border z-40 transition-all duration-300",
          // モバイル
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // デスクトップ
          isCollapsed ? "lg:w-16" : "lg:w-64",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <h1 className="text-xl font-bold text-primary animate-fade-in">
                  CocoFile
                </h1>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={
                  isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"
                }
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 overflow-y-auto p-2" role="navigation">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        "hover:scale-105 active:scale-95",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent text-foreground",
                        isCollapsed && "justify-center",
                      )}
                      title={isCollapsed ? item.label : undefined}
                      aria-label={item.description}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-transform",
                          isActive && "scale-110",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="font-medium animate-fade-in">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* フッター */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border animate-fade-in">
              <p className="text-xs text-muted-foreground text-center">
                CocoFile v0.1.0
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* メインコンテンツのスペーサー */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300",
          isCollapsed ? "lg:w-16" : "lg:w-64",
        )}
        aria-hidden="true"
      />
    </>
  );
}
