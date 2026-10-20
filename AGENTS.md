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
- Budget requests currently download a text document in the browser; do not imply they are sent without connecting a delivery service.
- Give each public content route its own Spanish page metadata for distinct search and social previews.
- Account areas live under the `_authenticated` layout (`/panel`) with role-based tabs; roles are kept in a separate roles table and enforced by database policies, since UI checks alone are bypassable.
- The very first account to sign up becomes administrator; later sign-ups are clients until an admin changes their role — gives the owner a way in without seeding users.
- Clock-in locations use demo coordinates from `src/lib/work-time.ts`, not the device location, by owner choice.
