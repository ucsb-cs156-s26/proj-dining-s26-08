import {
  cellToAxiosParamsToggleAdmin,
  cellToAxiosParamsToggleModerator,
  onToggleAdminSuccess,
  onToggleModeratorSuccess,
  onToggleAdminResult,
} from "main/utils/Users";
import mockConsole from "tests/testutils/mockConsole";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("Users Utils", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  describe("cellToAxiosParamsToggleAdmin", () => {
    test("returns the correct params for toggling admin", () => {
      const cell = {
        row: {
          original: {
            id: 42,
          },
        },
      };

      const result = cellToAxiosParamsToggleAdmin(cell);

      expect(result).toEqual({
        url: "/api/admin/toggleAdmin",
        method: "PUT",
        params: {
          id: 42,
        },
      });
    });
  });

  describe("cellToAxiosParamsToggleModerator", () => {
    test("returns the correct params for toggling moderator", () => {
      const cell = {
        row: {
          original: {
            id: 17,
          },
        },
      };

      const result = cellToAxiosParamsToggleModerator(cell);

      expect(result).toEqual({
        url: "/api/admin/toggleModerator",
        method: "PUT",
        params: {
          id: 17,
        },
      });
    });
  });

  describe("onToggleAdminSuccess", () => {
    test("It puts the given message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();

      onToggleAdminSuccess("Admin status toggled");

      expect(console.log).toHaveBeenCalledWith("Admin status toggled");
      expect(mockToast).toHaveBeenCalledWith("Admin status toggled");

      restoreConsole();
    });
  });

  describe("onToggleModeratorSuccess", () => {
    test("It puts the given message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();

      onToggleModeratorSuccess("Moderator status toggled");

      expect(console.log).toHaveBeenCalledWith("Moderator status toggled");
      expect(mockToast).toHaveBeenCalledWith("Moderator status toggled");

      restoreConsole();
    });
  });

  describe("onToggleAdminResult", () => {
    test("When the server's admin value differs from the row's, toasts 'Admin status toggled'", () => {
      const restoreConsole = mockConsole();
      const cell = { row: { original: { id: 5, admin: false } } };
      const data = { id: 5, admin: true };

      onToggleAdminResult(data, cell);

      expect(mockToast).toHaveBeenCalledWith("Admin status toggled");
      expect(console.log).toHaveBeenCalledWith("Admin status toggled");
      restoreConsole();
    });

    test("When the server's admin value equals the row's (no-op for super admin), toasts a clearer message", () => {
      const restoreConsole = mockConsole();
      const cell = { row: { original: { id: 1, admin: true } } };
      const data = { id: 1, admin: true };

      onToggleAdminResult(data, cell);

      expect(mockToast).toHaveBeenCalledWith(
        "Cannot toggle admin status: this user is a super admin.",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Cannot toggle admin status: this user is a super admin.",
      );
      restoreConsole();
    });

    test("Also flags the unchanged case when both rows are admin=false (e.g. another super admin whose flag is false)", () => {
      const restoreConsole = mockConsole();
      const cell = { row: { original: { id: 2, admin: false } } };
      const data = { id: 2, admin: false };

      onToggleAdminResult(data, cell);

      expect(mockToast).toHaveBeenCalledWith(
        "Cannot toggle admin status: this user is a super admin.",
      );
      restoreConsole();
    });

    test("Treats an undefined server response as a change and toasts 'Admin status toggled'", () => {
      const restoreConsole = mockConsole();
      const cell = { row: { original: { id: 9, admin: true } } };

      onToggleAdminResult(undefined, cell);

      expect(mockToast).toHaveBeenCalledWith("Admin status toggled");
      restoreConsole();
    });
  });
});
