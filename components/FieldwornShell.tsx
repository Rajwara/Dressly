import { FieldwornChromeBehavior, FieldwornFooter, FieldwornHeader } from "@/components/fieldworn/FieldwornChrome";
import "@/app/(site)/fieldworn-site.css";
import { fieldwornFonts } from "@/lib/fieldworn-fonts";
import { imageSrc } from "@/lib/images";

/**
 * Wraps a store page in the homepage branding: its fonts and colours, and
 * its header and footer.
 */
export default function FieldwornShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`fwb ${fieldwornFonts} ${className}`}>
      <FieldwornHeader />
      {children}
      <FieldwornFooter image={imageSrc("images/content/story")} />
      <FieldwornChromeBehavior />
    </div>
  );
}
