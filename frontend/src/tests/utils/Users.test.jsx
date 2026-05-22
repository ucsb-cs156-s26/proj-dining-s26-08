import {
  cellToAxiosParamsToggleAdmin,
  cellToAxiosParamsToggleModerator,
  onToggleAdminSuccess,
  onToggleModeratorSuccess,
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
});
