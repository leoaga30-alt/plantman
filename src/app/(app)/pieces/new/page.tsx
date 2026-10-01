"use client";

import { createRoom } from "@/app/actions/rooms";
import { RoomForm } from "@/components/RoomForm";
import { useRouter } from "next/navigation";

export default function NewRoomPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    light: "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN";
    humidity: "DRY" | "NORMAL" | "HUMID";
    tempSummer: number;
    tempWinter: number;
    nearHeater: boolean;
    notes?: string;
  }) => {
    await createRoom(data);
    router.push("/pieces");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Nouvelle pièce</h1>
        <RoomForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
