import AddFilter from "./AddFilter"
import { getRootFilter, useFilterList, LogicalFilterProps, ConditionalFilterProps, FilterProps, isConditionalFilterProps, useFilterDispatch } from "./FilterContext"
import RemoveFilter from "./RemoveFilter"

export function ConditionalFilterItem(
  { filter, parentId }: { filter: ConditionalFilterProps, parentId: string | undefined }
) {
  const filterList = useFilterList()

  return (
    <div>
      <h4>Conditional Filter({filter.id})</h4>
      <div>
        <AddFilter parentId={filter.id} />
        <RemoveFilter filterId={filter.id} parentId={parentId} />
      </div>
      <div>Operator: {filter.operator}</div>
      <div>Operands: </div>
      <div>
        {
          filter.childIds
            .map((childId) => {
              const child = filterList![childId]

              return <FilterItem key={child.id} filter={child} parentId={filter.id} />
            })
        }
      </div>
    </div>
  )
}

export function LogicalFilterItem(
  { filter, parentId }: { filter: LogicalFilterProps; parentId: string }
) {
  const dispatch = useFilterDispatch()

  function onOperandChanged(value: string, index: number) {
    const operands = [...filter.operands]
    operands.splice(index, 1, value)

    dispatch!({
      type: "UPDATE_FILTER",
      filterId: filter.id,
      params: {
        operands
      } as Partial<FilterProps>
    })
  }

  return (
    <div>
      <span>
        {filter.id} {filter.operator}: {
          filter.operands.map((operand, index) => (
            <input
              type="text"
              key={index}
              value={operand}
              onChange={(e) => onOperandChanged(e.target.value, index)} />
          ))
        }
      </span>
      <RemoveFilter filterId={filter.id} parentId={parentId} />
    </div>
  )
}

export function FilterItem(
  { filter, parentId }: { filter: FilterProps; parentId: string | undefined }
) {
  if (isConditionalFilterProps(filter)) {
    return <ConditionalFilterItem filter={filter} parentId={parentId} />
  } else {
    return <LogicalFilterItem filter={filter} parentId={parentId!} />
  }
}

export function FilterEditor() {
  const filterList = useFilterList()
  const rootFilter = getRootFilter(filterList!)

  return <FilterItem filter={rootFilter} parentId={undefined} />
}
