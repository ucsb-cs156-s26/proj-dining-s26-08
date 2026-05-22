import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";

describe("UserTable tests", () => {
  const testId = "UsersTable";

  test("renders without crashing for empty table", () => {
    render(<UsersTable users={[]} />);
  });

  test("renders without crashing for three users", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);
  });

  test("Has the expected colum headers and content", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    const expectedHeaders = [
      "id",
      "First Name",
      "Last Name",
      "Email",
      "Admin",
      "Moderator",
      "Alias",
      "Proposed Alias",
    ];
    const expectedFields = [
      "id",
      "givenName",
      "familyName",
      "email",
      "admin",
      "moderator",
      "alias",
      "proposedAlias",
    ];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-admin`),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-moderator`),
    ).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-admin`),
    ).toHaveTextContent("false");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-moderator`),
    ).toHaveTextContent("false");
  });

  test("Status column appends approval date only for approved users with a valid date", () => {
    render(
      <UsersTable
        users={[
          { id: 1, status: "Approved", dateApproved: "2024-10-31" },
          { id: 2, status: "Approved", dateApproved: null },
          { id: 3, status: "Rejected", dateApproved: "2024-11-01" },
          { id: 4, status: "Awaiting Moderation", dateApproved: null },
        ]}
      />,
    );

    expect(screen.getByText("Approved on 10/31/2024")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Moderation")).toBeInTheDocument();
  });

  test("Toggle Admin and Toggle Moderator buttons are absent by default", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Moderator-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-header-Toggle Admin`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-header-Toggle Moderator`),
    ).not.toBeInTheDocument();
  });

  test("Toggle buttons stay hidden when showToggleButtons is false even if callbacks are provided", () => {
    const adminCb = vi.fn();
    const modCb = vi.fn();
    render(
      <UsersTable
        users={usersFixtures.threeUsers}
        toggleAdminCallback={adminCb}
        toggleModeratorCallback={modCb}
        showToggleButtons={false}
      />,
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Moderator-button`),
    ).not.toBeInTheDocument();
  });

  test("Toggle buttons stay hidden by default when callbacks are provided but showToggleButtons is omitted", () => {
    const adminCb = vi.fn();
    const modCb = vi.fn();
    render(
      <UsersTable
        users={usersFixtures.threeUsers}
        toggleAdminCallback={adminCb}
        toggleModeratorCallback={modCb}
      />,
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Moderator-button`),
    ).not.toBeInTheDocument();
  });

  test("Toggle Admin button renders and fires the provided callback with the cell", async () => {
    const adminCb = vi.fn();
    render(
      <UsersTable
        users={usersFixtures.threeUsers}
        toggleAdminCallback={adminCb}
        showToggleButtons={true}
      />,
    );

    expect(
      screen.getByTestId(`${testId}-header-Toggle Admin`),
    ).toBeInTheDocument();

    const button = screen.getByTestId(
      `${testId}-cell-row-1-col-Toggle Admin-button`,
    );
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-warning");
    await userEvent.click(button);

    expect(adminCb).toHaveBeenCalledTimes(1);
    const calledWithCell = adminCb.mock.calls[0][0];
    expect(calledWithCell.row.original.id).toBe(2);
  });

  test("Toggle Moderator button renders and fires the provided callback with the cell", async () => {
    const modCb = vi.fn();
    render(
      <UsersTable
        users={usersFixtures.threeUsers}
        toggleModeratorCallback={modCb}
        showToggleButtons={true}
      />,
    );

    expect(
      screen.getByTestId(`${testId}-header-Toggle Moderator`),
    ).toBeInTheDocument();

    const button = screen.getByTestId(
      `${testId}-cell-row-2-col-Toggle Moderator-button`,
    );
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-info");
    await userEvent.click(button);

    expect(modCb).toHaveBeenCalledTimes(1);
    const calledWithCell = modCb.mock.calls[0][0];
    expect(calledWithCell.row.original.id).toBe(3);
  });

  test("Only Toggle Admin column appears when only that callback is supplied with showToggleButtons", () => {
    const adminCb = vi.fn();
    render(
      <UsersTable
        users={usersFixtures.threeUsers}
        toggleAdminCallback={adminCb}
        showToggleButtons={true}
      />,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Moderator-button`),
    ).not.toBeInTheDocument();
  });

  test("Only Toggle Moderator column appears when only that callback is supplied with showToggleButtons", () => {
    const modCb = vi.fn();
    render(
      <UsersTable
        users={usersFixtures.threeUsers}
        toggleModeratorCallback={modCb}
        showToggleButtons={true}
      />,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Toggle Moderator-button`),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
    ).not.toBeInTheDocument();
  });
});
