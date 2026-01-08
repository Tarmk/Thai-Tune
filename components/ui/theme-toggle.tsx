"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can show the toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-8 h-8 p-0 border border-maroon hover:bg-[#F8F1F3] hover:text-maroon relative overflow-hidden opacity-0"
      >
        <span className="sr-only">Loading theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 p-0 border border-maroon hover:bg-[#F8F1F3] hover:text-maroon dark:border-[#8A3D4C] dark:hover:bg-[#333b52] relative overflow-hidden transition-colors duration-300"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 absolute" />
          <Moon className="h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 absolute text-white" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[8rem] p-1 rounded-lg border-maroon dark:border-[#8A3D4C] dark:bg-[#232838] shadow-md"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer px-3 py-2 rounded-md text-sm transition-colors duration-200"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer px-3 py-2 rounded-md text-sm transition-colors duration-200"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer px-3 py-2 rounded-md text-sm transition-colors duration-200"
          onClick={() => setTheme("system")}
        >
          <span className="h-4 w-4 flex items-center justify-center">💻</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
