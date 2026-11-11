<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared navigation, service presentation, and quote interactions in a reusable site module so public pages stay consistent.
- Budget requests are saved to the database and shown to staff in the panel "Solicitudes" tab; no email notification is sent.
- Give each public content route its own Spanish page metadata for distinct search and social previews.
- Account areas live under the `_authenticated` layout (`/panel`) with role-based tabs; roles are kept in a separate roles table and enforced by database policies, since UI checks alone are bypassable.
- The very first account to sign up becomes administrator; later sign-ups are clients until an admin changes their role — gives the owner a way in without seeding users.
- Clock-in locations use demo coordinates from `src/lib/work-time.ts`, not the device location, by owner choice.
- The AI chat assistant runs in a protected server function that inserts replies with the admin client (is_ai=true, sender_id null); its knowledge lives in one editable prompt constant, and handoff rules are a pure tested module — keeps behaviour editable and auditable.
- The brand mark is `src/assets/logo.svg`; `public/favicon.svg` is a square, padded derivative of it (not a copy), so regenerate the favicon whenever the mark changes.
- The service list has one source of truth in `src/lib/i18n.tsx` (`SERVICE_VALUES` plus the per-service copy and photos); the services grid, the quote-form dropdown and the staff panel all read from it, so a new service is added there rather than in page markup.
- Account-area UI copy lives in `src/lib/panel-i18n.ts` (keyed by the shared language from `src/lib/i18n.tsx`); stored DB values (statuses, services) stay Spanish and are mapped to labels at render, and a signed-in user's choice syncs to `profiles.preferred_language`.
