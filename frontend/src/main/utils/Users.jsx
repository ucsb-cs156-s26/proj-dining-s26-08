import { toast } from "react-toastify";

export const cellToAxiosParamsToggleAdmin = (cell) => ({
  method: "PUT",
  url: "/api/admin/toggleAdmin",
  params: {
    id: cell.row.original.id,
  },
});

export const cellToAxiosParamsToggleModerator = (cell) => ({
  method: "PUT",
  url: "/api/admin/toggleModerator",
  params: {
    id: cell.row.original.id,
  },
});

export function onToggleAdminSuccess(message) {
  console.log(message);
  toast(message);
}

export function onToggleModeratorSuccess(message) {
  console.log(message);
  toast(message);
}
