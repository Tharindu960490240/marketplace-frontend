import { render, screen } from "@testing-library/react";
import "./i18n";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {} }));
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ data: [], total: 0 })),
    }),
  );
});

test("renders the marketplace home page", async () => {
  render(<App />);
  expect(
    await screen.findByText(/Marketplace for Animals, Pets & Farm Supplies/i),
  ).toBeInTheDocument();
});
