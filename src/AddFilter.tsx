import { FilterProps, useFilterDispatch } from "./FilterContext"

function randomFilterParams(): Partial<FilterProps> {
  const rand = Math.random()

  if (rand < 0.2) {
    return {
      operator: 'LT',
      operands: ["LEFT", "RIGHT"]
    }
  } else if (rand < 0.4) {
    return {
      operator: 'EQ',
      operands: ["LEFT", "RIGHT"]
    }
  } else if (rand < 0.6) {
    return {
      operator: 'IS_NULL',
      operands: ["VALUE"]
    }
  } else if (rand < 0.8) {
    return {
      operator: 'AND',
      childIds: []
    }
  } else {
    return {
      operator: 'OR',
      childIds: []
    }
  }
}

export default function AddFilter({ parentId }: { parentId: string }) {
  const dispatch = useFilterDispatch()

  return (
    <button onClick={() => {
      dispatch!({
        type: 'CREATE_FILTER',
        parentId,
        params: randomFilterParams()
      });
    }}>Add</button>
  )
}
