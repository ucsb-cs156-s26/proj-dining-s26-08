import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { vi } from "vitest";

describe("ReviewForm tests", () => {
  test("renders without crashing", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);
  });

  test("renders item name as disabled field", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    const itemName = screen.getByLabelText(/item name/i);

    expect(itemName).toBeDisabled();
    expect(itemName).toHaveValue("Pizza");
  });

  test("renders comments, stars, and date fields", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/comments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stars/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date and time/i)).toBeInTheDocument();
  });

  test("comments field defaults to empty string", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/comments/i)).toHaveValue("");
  });

  test("stars field defaults to 5", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/stars/i)).toHaveValue("5");
  });

  test("date field has a default value", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/date and time/i).value).not.toBe("");
  });

  test("date field uses datetime-local format", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    const dateValue = screen.getByLabelText(
      /date and time item was served/i,
    ).value;

    expect(dateValue).toHaveLength(16);
    expect(dateValue).not.toContain("Z");
  });

  test("default values are loaded into the form", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/comments/i)).toHaveValue("");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("5");
  });

  test("calls submitAction with correct values on submit", async () => {
    const submitAction = vi.fn();

    render(<ReviewForm initialItemName="Pizza" submitAction={submitAction} />);

    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: "Delicious!" },
    });

    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "4" },
    });

    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-04-01T12:00" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));

    expect(submitAction).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewerComments: "Delicious!",
        itemsStars: 4,
        dateItemServed: "2024-04-01T12:00",
      }),
      expect.anything(),
    );
  });

  test("renders with initialContents", () => {
    const initialContents = {
      reviewerComments: "Good food",
      itemsStars: 3,
      dateItemServed: "2024-04-01T12:00",
    };

    render(
      <ReviewForm
        initialItemName="Pizza"
        submitAction={vi.fn()}
        initialContents={initialContents}
      />,
    );

    expect(screen.getByLabelText(/comments/i)).toHaveValue("Good food");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("3");
  });

  test("stars field shows is-invalid class when validation fails", async () => {
    const submitAction = vi.fn();

    render(<ReviewForm initialItemName="Pizza" submitAction={submitAction} />);

    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() =>
      expect(screen.getByLabelText(/date and time/i)).toHaveClass("is-invalid"),
    );
  });

  test("date required error message appears when date is empty", async () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() =>
      expect(screen.getByText(/date is required/i)).toBeInTheDocument(),
    );
  });

  test("comments field has no error class when valid", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/comments/i)).not.toHaveClass("is-invalid");
  });

  test("stars field has no error class when valid", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/stars/i)).not.toHaveClass("is-invalid");
  });

  test("date field has no error class when valid", () => {
    render(<ReviewForm initialItemName="Pizza" submitAction={vi.fn()} />);

    expect(screen.getByLabelText(/date and time/i)).not.toHaveClass(
      "is-invalid",
    );
  });

  test("preserves current values when initialContents becomes undefined", async () => {
    const submitAction = vi.fn();

    const { rerender } = render(
      <ReviewForm
        initialItemName="Pizza"
        submitAction={submitAction}
        initialContents={{
          reviewerComments: "Loaded review",
          itemsStars: 4,
          dateItemServed: "2024-04-01T12:00",
        }}
      />,
    );

    expect(screen.getByLabelText(/comments/i)).toHaveValue("Loaded review");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("4");

    rerender(
      <ReviewForm initialItemName="Pizza" submitAction={submitAction} />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/comments/i)).toHaveValue("Loaded review");
      expect(screen.getByLabelText(/stars/i)).toHaveValue("4");
      expect(screen.getByLabelText(/date and time/i)).toHaveValue(
        "2024-04-01T12:00",
      );
    });
  });

  test("resets form when initialContents changes", async () => {
    const submitAction = vi.fn();

    const { rerender } = render(
      <ReviewForm initialItemName="Pizza" submitAction={submitAction} />,
    );

    rerender(
      <ReviewForm
        initialItemName="Pizza"
        submitAction={submitAction}
        initialContents={{
          reviewerComments: "Updated comment",
          itemsStars: 3,
          dateItemServed: "2024-04-01T12:00",
        }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByLabelText(/comments/i)).toHaveValue("Updated comment"),
    );
  });
});
