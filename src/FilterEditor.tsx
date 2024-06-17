import AddFilter from "./AddFilter"
import { getRootFilter, useFilterList, LogicalFilterProps, ConditionalFilterProps, FilterProps, isConditionalFilterProps, useFilterDispatch } from "./FilterContext"
import RemoveFilter from "./RemoveFilter"
import { Flex } from "@radix-ui/themes"

function getIndentation(level: number) {
  switch (level) {
    case 0:
      return ""
    case 1:
      return "ml-3"
    case 2:
      return "ml-6"
    case 3:
      return "ml-9"
    case 4:
      return "ml-12"
    case 5:
      return "ml-15"
    default:
      throw new Error(`The indentation level is too deep, the maximum level is 5, got ${level}`)
  }
}

export function ConditionalFilterItem(
  { filter, parentId, level }: { filter: ConditionalFilterProps, parentId: string | undefined; level: number }
) {
  const filterList = useFilterList()

  return (
    <Flex direction="column" className={getIndentation(level)}>
      <Flex align="center" gap="3">
        <h3 className="font-bold">{filter.operator}</h3>
        <AddFilter parentId={filter.id} />
        <RemoveFilter filterId={filter.id} parentId={parentId} />
      </Flex>
      <div className="font-medium">Operands: </div>
      <div className="w-full">
        {
          filter.childIds
            .map((childId) => {
              const child = filterList![childId]

              return <FilterItem key={child.id} filter={child} parentId={filter.id} level={level + 1} />
            })
        }
      </div>
    </Flex >
  )
}

export function LogicalFilterItem(
  { filter, parentId, level }: { filter: LogicalFilterProps; parentId: string; level: number }
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
    <Flex align="center" gap="2" className={["my-2", getIndentation(level)].join(" ")}>
      <span>
        {filter.operator}:
      </span>
      {
        filter.operands.map((operand, index) => (
          <input
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            type="text"
            key={index}
            value={operand}
            onChange={(e) => onOperandChanged(e.target.value, index)} />
        ))
      }
      <Flex align="end" direction="column" className="grow">
        <RemoveFilter filterId={filter.id} parentId={parentId} />
      </Flex>
    </Flex>
  )
}

export function FilterItem(
  { filter, parentId, level }: { filter: FilterProps; parentId: string | undefined; level: number }
) {
  if (isConditionalFilterProps(filter)) {
    return <ConditionalFilterItem filter={filter} parentId={parentId} level={level} />
  } else {
    return <LogicalFilterItem filter={filter} parentId={parentId!} level={level} />
  }
}

export function FilterEditor() {
  const filterList = useFilterList()
  const rootFilter = getRootFilter(filterList!)

  return <FilterItem filter={rootFilter} parentId={undefined} level={0} />
}
