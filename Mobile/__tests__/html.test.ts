import { stripHtml, isEmptyHtml } from "@/utils/html";

describe("stripHtml", () => {
  it("retire les balises et décode les entités", () => {
    expect(stripHtml("<p>Bonjour&nbsp;&amp; paix</p>")).toBe("Bonjour & paix");
  });

  it("préserve les sauts de paragraphe", () => {
    expect(stripHtml("<p>Un</p><p>Deux</p>")).toBe("Un\nDeux");
  });

  it("gère null/undefined", () => {
    expect(stripHtml(null)).toBe("");
    expect(stripHtml(undefined)).toBe("");
  });
});

describe("isEmptyHtml", () => {
  it("vrai pour du HTML sans texte visible", () => {
    expect(isEmptyHtml("<p></p>")).toBe(true);
    expect(isEmptyHtml("<div><br/></div>")).toBe(true);
  });
  it("faux quand il y a du texte", () => {
    expect(isEmptyHtml("<p>Texte</p>")).toBe(false);
  });
});
