"use client";

import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadIcs, googleCalendarUrl, type IcsItem } from "@/lib/ics";
import { cn } from "@/lib/utils";

interface Props {
  item: IcsItem;
  label?: string;
  size?: "sm" | "default" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

/** Bouton « Ajouter au calendrier » : téléchargement .ics ou lien Google Agenda. */
export function AddToCalendar({
  item,
  label = "Ajouter au calendrier",
  size = "sm",
  variant = "outline",
  className,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          className={cn(className)}
        >
          <CalendarPlus className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">{label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => downloadIcs(item)}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger (.ics)
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={googleCalendarUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Google Agenda
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
