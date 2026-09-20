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
      assessmentSessions: {
        orderBy: { completedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const allCommunities = await prisma.community.findMany({
    orderBy: { name: "asc" },
  });

  const history = user.assessmentSessions.map((s) => ({
    id: s.id,
    score: s.score,
    completedAt: s.completedAt ? s.completedAt.toISOString() : null,
    facilityGapCount: s.facilityGapCount,
    awarenessGapCount: s.awarenessGapCount,
  }));

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
      history={history}
    />
  );
}
