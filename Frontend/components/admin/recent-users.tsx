import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const recentUsers = [
  {
    id: 1,
    name: "Samuel Diambu",
    email: "samueldiambu@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    date: "Il y a 2 heures",
  },
  {
    id: 2,
    name: "Isaac Akonkwa",
    email: "akonkwaushindi@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    date: "Il y a 5 heures",
  },
  {
    id: 3,
    name: "Wani Rudendeza",
    email: "wanirudendeza@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "pending",
    date: "Il y a 1 jour",
  },
  {
    id: 4,
    name: "Père Ciza",
    email: "pere.ciza@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    date: "Il y a 2 jours",
  },
  {
    id: 5,
    name: "David Cubaka",
    email: "davidcubaka.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "inactive",
    date: "Il y a 3 jours",
  },
];

export default function AdminRecentUsers() {
  return (
    <div className="space-y-4">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
              />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                user.status === "active"
                  ? "default"
                  : user.status === "pending"
                    ? "outline"
                    : "secondary"
              }
            >
              {user.status === "active"
                ? "Actif"
                : user.status === "pending"
                  ? "En attente"
                  : "Inactif"}
            </Badge>
            <span className="text-xs text-muted-foreground">{user.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
