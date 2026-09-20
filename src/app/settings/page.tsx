import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      community: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const allCommunities = await prisma.community.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <SettingsClient
      initialUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        communityId: user.communityId,
        community: user.community,
      }}
      communities={allCommunities}
    />
  );
}
