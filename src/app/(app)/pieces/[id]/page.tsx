"use client";

import { getRoom, updateRoom, deleteRoom } from "@/app/actions/rooms";
import { RoomForm } from "@/components/RoomForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Room } from "@prisma/client";

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await getRoom(params.id);
        setRoom(data);
      } catch (err) {
        console.error("Failed to load room:", err);
        router.push("/pieces");
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [params.id, router]);

  const handleSubmit = async (data: {
    name: string;
    light: "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN";
    humidity: "DRY" | "NORMAL" | "HUMID";
    tempSummer: number;
    tempWinter: number;
    nearHeater: boolean;
    notes?: string;
  }) => {
    await updateRoom(params.id, data);
    router.push("/pieces");
  };

  const handleDelete = async () => {
    if (
      !confirm("Êtes-vous sûr ? Cette action ne peut pas être annulée.")
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteRoom(params.id);
      router.push("/pieces");
    } catch (err) {
      console.error("Failed to delete room:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pièce non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
        <RoomForm room={room} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
