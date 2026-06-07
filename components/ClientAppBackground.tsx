import { clientBackgroundImage } from "@/lib/client-ui";

export function ClientAppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="animate-login-ken-burns absolute inset-0 origin-center bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: `url(${clientBackgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/[0.82] to-black/[0.75]" />
    </div>
  );
}
