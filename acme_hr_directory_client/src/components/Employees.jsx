import { useState, useEffect } from "react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        console.log('Fetching departments...');
        const response = await fetch('http://localhost:3000/departments');
        const data = await response.json();
        console.log('data ', data);
        setDepartments(data);
      } catch (error) {
        console.error(error);
      }
    };
    getDepartments();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department_id: departmentId }),
    });

    if (res.ok) {
      const newEmployee = await res.json();
      setEmployees([...employees, newEmployee]);
      setName("");
      setDepartmentId("");
    }
  }

  return (
    <>
      <div>
      <h1>Employee Directory</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          required
        >
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

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{departments.find((d) => d.id === emp.department_id)?.name || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}