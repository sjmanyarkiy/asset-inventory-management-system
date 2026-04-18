import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AssetList from "../AssetList";

describe("AssetList UX states", () => {
  test("shows loading skeleton state", () => {
    render(<AssetList loading assets={[]} />);

    expect(screen.getByText(/loading assets/i)).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  test("shows friendly error and allows retry", () => {
    const onRetry = jest.fn();

    render(<AssetList error="boom" assets={[]} onRetry={onRetry} />);

    expect(screen.getByText(/couldn’t load assets/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("shows empty state guidance", () => {
    render(<AssetList assets={[]} />);

    expect(screen.getByText(/no assets found/i)).toBeInTheDocument();
    expect(screen.getByText(/click “add asset” to get started/i)).toBeInTheDocument();
  });

  test("renders color-coded status badge", () => {
    const assets = [
      {
        id: 1,
        name: "Laptop 1",
        category: "Computers",
        asset_type: "Laptop",
        department: "Engineering",
        status: "assigned",
        image_file: null,
      },
    ];

    render(<AssetList assets={assets} />);

    const badge = screen.getByText(/assigned/i);
    expect(badge).toHaveClass("bg-green-100");
    expect(badge).toHaveClass("text-green-800");
  });
});
