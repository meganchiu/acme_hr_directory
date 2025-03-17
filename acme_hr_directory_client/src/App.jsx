import { Routes, Route } from 'react-router-dom'
import Employees from './components/Employees.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Employees />} />
      </Routes>
    </>
  )
}

export default App
