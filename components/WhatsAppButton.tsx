import { WHATSAPP_URL } from "@/lib/brand";
import "./whatsapp-button.css";

/** Floating chat button: opens a WhatsApp chat with Dressly. */
export default function WhatsAppButton() {
  return (
    <a className="chat-float" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      </svg>
      <span>Chat</span>
    </a>
  );
}
