import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { LANG_KEY, LangProvider } from "@/lib/i18n";
import { QuoteForm } from "@/components/clean-site";

const withLang = () => (
  <LangProvider>
    <QuoteForm />
  </LangProvider>
);

/** The quote form must always ask for the property's full address, in both languages. */
describe("quote form property address", () => {
  beforeEach(() => window.localStorage.clear());

  it("asks for a required property address in English", async () => {
    window.localStorage.setItem(LANG_KEY, "en");
    render(withLang());

    const input = await screen.findByRole("textbox", { name: /Property Address/i });
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("autocomplete", "street-address");
  });

  it("asks for a required property address in Spanish", async () => {
    window.localStorage.setItem(LANG_KEY, "es");
    render(withLang());

    const input = await screen.findByRole("textbox", { name: /Dirección de la propiedad/i });
    expect(input).toHaveAttribute("aria-required", "true");
  });
});
