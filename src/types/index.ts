export type Role = "WARGA" | "PENGURUS" | "ADMIN";

export type UserStatus = "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";

export type AssessmentAnswerType = "YA" | "TIDAK" | "TIDAK_TAHU";

export type QuestionCategory =
  | "EVACUATION"
  | "FACILITY"
  | "INFORMATION"
  | "EMERGENCY_CONTACT";

export type GapType = "FACILITY_GAP" | "AWARENESS_GAP";

export interface ActionPlanItem {
  id: string;
  category: QuestionCategory | string;
  gapType: GapType;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  targetRole: "WARGA" | "PENGURUS" | "ALL";
}

export interface AssessmentResult {
  score: number; // 0 - 100
  totalQuestions: number;
  metCount: number;
  facilityGapCount: number;
  awarenessGapCount: number;
  metIndicators: {
    questionId: string;
    question: string;
    category: string;
  }[];
  facilityGaps: {
    questionId: string;
    question: string;
    category: string;
    actionNeeded: string;
  }[];
  awarenessGaps: {
    questionId: string;
    question: string;
    category: string;
    actionNeeded: string;
  }[];
  actionPlan: ActionPlanItem[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  communityId: string | null;
}

export type EvacuationPointType = "ASSEMBLY_POINT" | "AID_POST" | "HAZARD_POINT";
