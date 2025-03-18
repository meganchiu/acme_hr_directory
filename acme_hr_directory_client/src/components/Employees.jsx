import { useState, useEffect } from "react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
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
    
    const body = { name, department_id: Number(departmentId) };
    console.log('Form Data Being Sent:', body);
    
    const res = await fetch("http://localhost:3000/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newEmployee = await res.json();
      setEmployees([...employees, newEmployee]);
      setName("");
      setDepartmentId("");
    } else {
      const errorResponse = await res.json();
      console.log('Error Response:', errorResponse);
    }
  }

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