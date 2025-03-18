import { useState, useEffect } from "react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");

  // Fetch departments
  useEffect(() => {
    const getDepartments = async () => {
      try {
        console.log("Fetching departments...");
        const response = await fetch("http://localhost:3000/departments");
        const data = await response.json();
        console.log("Departments:", data);
        setDepartments(data);
      } catch (error) {
        console.error(error);
      }
    };
    getDepartments();
    getEmployees();
  }, []);

  // Fetch employees
  const getEmployees = async () => {
    try {
      console.log("Fetching employees...");
      const response = await fetch("http://localhost:3000/employees");
      const data = await response.json();
      console.log("Employees:", data);
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Handle employee deletion
  const handleDelete = async (id) => {
    try {
      console.log(`Attempting to delete employee with ID: ${id}`);
      const res = await fetch(`http://localhost:3000/employees/${id}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        console.log(`Successfully deleted employee with ID: ${id}`);
        setEmployees(employees.filter((employee) => employee.id !== id));
      } else {
        const errorData = await res.json();
        console.error("Failed to delete employee:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  // Handle adding new employee
  async function handleSubmit(e) {
    e.preventDefault();
    
    const body = { name, department_id: Number(departmentId) };
    console.log("Form Data Being Sent:", body);
    
    const res = await fetch("http://localhost:3000/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  
    if (res.ok) {
      setName("");
      setDepartmentId("");
  
      getEmployees();
    } else {
      const errorResponse = await res.json();
      console.log("Error Response:", errorResponse);
    }
  }

  // Handle employee update
  const handleUpdate = async () => {
    const body = {};
    if (editName) body.name = editName;
    if (editDepartmentId) body.department_id = editDepartmentId;

    try {
      const res = await fetch(`http://localhost:3000/employees/${editEmployeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Failed to update employee");
        return;
      }

      const updatedEmployee = await res.json();
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        )
      );

      setEditEmployeeId(null);
      setEditName("");
      setEditDepartmentId("");
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <>
      <div>
        <h1>Employee Directory</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First & Last Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            required
          >
            <option value="">Select a department</option>
            {departments.length > 0 ? (
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))
            ) : (
              <option disabled>Loading departments...</option>
            )}
          </select>
          <button type="submit">Add Employee</button>
        </form>

        {editEmployeeId && (
          <div>
            <h2>Update Employee</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
            >
              <input
                type="text"
                placeholder="Update Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <select
                value={editDepartmentId}
                onChange={(e) => setEditDepartmentId(Number(e.target.value))}
              >
                <option value="">Select a department</option>
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading departments...</option>
                )}
              </select>
              <button type="submit">Update Employee</button>
            </form>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>
                  {departments.find((d) => d.id === emp.department_id)?.name || "N/A"}
                </td>
                <td>
                  <button
                    onClick={() => {
                      setEditEmployeeId(emp.id);
                      setEditName(emp.name);
                      setEditDepartmentId(emp.department_id);
                    }}
                  >
                    Update
                  </button>
                  <button onClick={() => handleDelete(emp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}