import type { Metadata } from "next";
import BranchLocator from "@/components/BranchLocator";
import PageBanner from "@/components/PageBanner";
import FieldwornShell from "@/components/FieldwornShell";
import { branchCards } from "@/lib/branch-cards";
import "./branches-brand.css";

export const metadata: Metadata = {
  title: "Branches",
  description: "Find your nearest Dressly branch: 13 abaya tailoring stores across Abu Dhabi, Dubai, Sharjah, Ajman and Ras Al Khaimah.",
};

export default function BranchesPage() {
  return (
    <FieldwornShell className="fw-overlay">
      <PageBanner
        image="images/pages/branches"
        eyebrow="*13 branches · 5 Emirates"
        title="Our branches"
        text="Visit any of our branches across the Emirates to choose fabrics and be measured, or book a tailor to come to you."
      />
      <BranchLocator branches={branchCards()} />
    </FieldwornShell>
  );
}
