import { HUMIDITY_LABEL, LIGHT_LABEL, label } from "@/lib/labels";
import { getRooms } from "@/app/actions/rooms";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Room } from "@prisma/client";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Pièces</h1>
          <Link href="/pieces/new">
            <Button>Ajouter une pièce</Button>
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune pièce créée. Commencez par ajouter une pièce.
            </p>
            <Link href="/pieces/new">
              <Button>Ajouter une pièce</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room: Room) => (
              <Link key={room.id} href={`/pieces/${room.id}`}>
                <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{room.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Lumière {label(LIGHT_LABEL, room.light)} • Humidité {label(HUMIDITY_LABEL, room.humidity)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Été: {room.tempSummer}°C • Hiver: {room.tempWinter}°C
                        {room.nearHeater && " • Radiateur proche"}
                      </p>
                    </div>
                    <div>→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
