import { render, waitFor, screen, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import AdminUsersPage from "main/pages/AdminUsersPage";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "tests/testutils/mockConsole";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("AdminUsersPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "UsersTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing on three users", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText("Users");
  });

  test("renders empty table when backend unavailable", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/admin/users",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("fetches users from correct API endpoint", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(3);
    });

    const apiCall = axiosMock.history.get.find(
      (call) => call.url === "/api/admin/users",
    );
    expect(apiCall).toBeDefined();
  });

  test("renders users table with data", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
  });

  test("Toggle Admin button calls PUT /api/admin/toggleAdmin and shows toast", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);
    axiosMock.onPut("/api/admin/toggleAdmin").reply(200, {
      id: 2,
      admin: true,
      moderator: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-1-col-Toggle Admin-button`),
      ).toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.click(
        screen.getByTestId(`${testId}-cell-row-1-col-Toggle Admin-button`),
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleAdmin");
    expect(axiosMock.history.put[0].params).toEqual({ id: 2 });
    expect(mockToast).toHaveBeenCalledWith("Admin status toggled");
  });

  test("Toggle Moderator button calls PUT /api/admin/toggleModerator and shows toast", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);
    axiosMock.onPut("/api/admin/toggleModerator").reply(200, {
      id: 3,
      admin: false,
      moderator: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-2-col-Toggle Moderator-button`),
      ).toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.click(
        screen.getByTestId(`${testId}-cell-row-2-col-Toggle Moderator-button`),
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleModerator");
    expect(axiosMock.history.put[0].params).toEqual({ id: 3 });
    expect(mockToast).toHaveBeenCalledWith("Moderator status toggled");
  });

  test("Toggle Admin against a super-admin still completes the PUT call (backend silently no-ops)", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);
    axiosMock.onPut("/api/admin/toggleAdmin").reply(200, {
      id: 1,
      email: "phtcon@ucsb.edu",
      admin: true,
      moderator: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
      ).toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.click(
        screen.getByTestId(`${testId}-cell-row-0-col-Toggle Admin-button`),
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(mockToast).toHaveBeenCalledWith("Admin status toggled");
  });

  test("Table refetches /api/admin/users after a successful toggle", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);
    axiosMock.onPut("/api/admin/toggleAdmin").reply(200, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-1-col-Toggle Admin-button`),
      ).toBeInTheDocument();
    });

    const usersGetsBefore = axiosMock.history.get.filter(
      (call) => call.url === "/api/admin/users",
    ).length;

    await act(async () => {
      await userEvent.click(
        screen.getByTestId(`${testId}-cell-row-1-col-Toggle Admin-button`),
      );
    });

    await waitFor(() => {
      const usersGetsAfter = axiosMock.history.get.filter(
        (call) => call.url === "/api/admin/users",
      ).length;
      expect(usersGetsAfter).toBeGreaterThan(usersGetsBefore);
    });
  });
});
