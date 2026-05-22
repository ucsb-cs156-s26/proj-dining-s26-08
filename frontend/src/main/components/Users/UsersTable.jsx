import OurTable, { ButtonColumn } from "main/components/OurTable";

export default function UsersTable({
  users,
  toggleAdminCallback,
  toggleModeratorCallback,
  showToggleButtons = false,
}) {
  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "First Name",
      accessor: "givenName",
    },
    {
      Header: "Last Name",
      accessor: "familyName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Admin",
      id: "admin",
      accessor: (row, _rowIndex) => String(row.admin), // hack needed for boolean values to show up
    },
    {
      Header: "Moderator",
      id: "moderator",
      accessor: (row, _rowIndex) => String(row.moderator),
    },
    {
      Header: "Alias",
      accessor: "alias",
    },
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias",
    },
    {
      Header: "Status",
      accessor: (row) => {
        if (row.status === "Approved" && row.dateApproved) {
          const [year, month, day] = row.dateApproved.split("-");
          const formattedDate = new Date(
            year,
            month - 1,
            day,
          ).toLocaleDateString();
          return `Approved on ${formattedDate}`;
        }
        return row.status;
      },
    },
  ];

  if (showToggleButtons && toggleAdminCallback) {
    columns.push(
      ButtonColumn(
        "Toggle Admin",
        "warning",
        toggleAdminCallback,
        "UsersTable",
      ),
    );
  }

  if (showToggleButtons && toggleModeratorCallback) {
    columns.push(
      ButtonColumn(
        "Toggle Moderator",
        "info",
        toggleModeratorCallback,
        "UsersTable",
      ),
    );
  }

  return <OurTable data={users} columns={columns} testid={"UsersTable"} />;
}
