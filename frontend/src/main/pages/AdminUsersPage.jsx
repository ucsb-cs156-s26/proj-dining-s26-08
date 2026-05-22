import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UsersTable from "main/components/Users/UsersTable";

import { useNavigate } from "react-router";
import { useQueryClient } from "react-query";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import {
  cellToAxiosParamsToggleAdmin,
  cellToAxiosParamsToggleModerator,
  onToggleAdminResult,
  onToggleModeratorSuccess,
} from "main/utils/Users";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const currentUserId = currentUser.data?.root?.user?.id;

  const {
    data: users,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users"],
    { method: "GET", url: "/api/admin/users" },
    [],
  );

  const toggleAdminMutation = useBackendMutation(
    cellToAxiosParamsToggleAdmin,
    {
      onSuccess: (data, cell) => {
        onToggleAdminResult(data, cell);
        if (cell.row.original.id === currentUserId && data?.admin === false) {
          queryClient.invalidateQueries("current user");
          navigate("/");
        }
      },
    },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users"],
  );

  const toggleModeratorMutation = useBackendMutation(
    cellToAxiosParamsToggleModerator,
    { onSuccess: () => onToggleModeratorSuccess("Moderator status toggled") },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users"],
  );

  const toggleAdminCallback = (cell) => toggleAdminMutation.mutate(cell);
  const toggleModeratorCallback = (cell) =>
    toggleModeratorMutation.mutate(cell);

  return (
    <BasicLayout>
      <h2>Users</h2>
      <UsersTable
        users={users}
        toggleAdminCallback={toggleAdminCallback}
        toggleModeratorCallback={toggleModeratorCallback}
        showToggleButtons={true}
      />
    </BasicLayout>
  );
};

export default AdminUsersPage;
