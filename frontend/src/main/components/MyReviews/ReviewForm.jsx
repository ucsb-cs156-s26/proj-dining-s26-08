import { Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function ReviewForm({
  initialItemName,
  submitAction,
  initialContents,
  submitButtonText = "Submit Review",
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reviewerComments: "",
      itemsStars: 5,
      dateItemServed: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    reset(initialContents);
  }, [initialContents, reset]);

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-item-name">Item Name</Form.Label>
        <Form.Control
          id="review-item-name"
          type="text"
          value={initialItemName}
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerComments">Comments</Form.Label>
        <Form.Control
          id="reviewerComments"
          as="textarea"
          rows={3}
          isInvalid={!!errors.reviewerComments}
          {...register("reviewerComments")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.reviewerComments?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemsStars">Stars (1 to 5)</Form.Label>
        <Form.Select
          id="itemsStars"
          isInvalid={!!errors.itemsStars}
          {...register("itemsStars", {
            valueAsNumber: true,
          })}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.itemsStars?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateItemServed">
          Date and Time Item was Served
        </Form.Label>
        <Form.Control
          id="dateItemServed"
          type="datetime-local"
          isInvalid={!!errors.dateItemServed}
          {...register("dateItemServed", {
            required: "Date is required",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateItemServed?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit">{submitButtonText}</Button>
    </Form>
  );
}
