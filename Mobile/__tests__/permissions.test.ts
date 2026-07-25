import { hasAccessToPage } from "@/lib/permissions";

describe("hasAccessToPage", () => {
  it("admin a accès à tout", () => {
    expect(hasAccessToPage("admin", "/admin")).toBe(true);
    expect(hasAccessToPage("admin", "/admin/n-importe-quoi")).toBe(true);
  });

  it("editeur accède au contenu mais pas aux utilisateurs", () => {
    expect(hasAccessToPage("editeur", "/admin/blog")).toBe(true);
    expect(hasAccessToPage("editeur", "/admin/events/new")).toBe(true);
    expect(hasAccessToPage("editeur", "/admin/users")).toBe(false);
  });

  it("membre limité au tableau de bord, équipe, tâches et profil", () => {
    expect(hasAccessToPage("membre", "/admin")).toBe(true);
    expect(hasAccessToPage("membre", "/admin/taches")).toBe(true);
    expect(hasAccessToPage("membre", "/admin/profile")).toBe(true);
    expect(hasAccessToPage("membre", "/admin/blog")).toBe(false);
    expect(hasAccessToPage("membre", "/admin/dons")).toBe(false);
  });
});
