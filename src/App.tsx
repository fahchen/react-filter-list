import './App.css'
import FilterProvider from './FilterContext'
import { FilterEditor } from './FilterEditor'

function App() {
  return (
    <>
      <FilterProvider initialFilter={{ operator: 'AND', operands: [] }}>
        <FilterEditor />
      </FilterProvider>
    </>
  )
}

export default App
