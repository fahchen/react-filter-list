/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useReducer, ReactNode, useContext } from "react";

type JSONPointer = string;

export type Filter = ConditionalFilter | LogicalFilter

export interface ConditionalFilter {
  operator: 'AND' | 'OR'
  operands: Array<ConditionalFilter | LogicalFilter>
}

export type LogicalFilter = EQFilter | LTFilter | IsNullFilter

export interface EQFilter {
  operator: 'EQ'
  operands: [JSONPointer, string]
}

export interface LTFilter {
  operator: 'LT'
  operands: [JSONPointer, string]
}

export interface IsNullFilter {
  operator: 'IS_NULL'
  operands: [JSONPointer]
}

export type FilterProps = ConditionalFilterProps | LogicalFilterProps

export interface ConditionalFilterProps {
  id: string
  operator: ConditionalFilter['operator']
  childIds: Array<string>
}

export interface LogicalFilterProps<O extends LogicalFilter['operator'] = LogicalFilter['operator']> {
  id: string
  operator: O
  // REFACTOR
  operands: O extends EQFilter['operator'] ? EQFilter['operands'] : O extends LTFilter['operator'] ? LTFilter['operands'] : O extends IsNullFilter['operator'] ? IsNullFilter['operands'] : never
}

export function isConditionalFilter(filter: Filter): filter is ConditionalFilter {
  return ['AND', 'OR'].includes(filter.operator)
}

export function isConditionalFilterProps(filter: FilterProps): filter is ConditionalFilterProps {
  return ['AND', 'OR'].includes(filter.operator)
}


const FilterListContext = createContext<FilterPropsList | null>(null)
const FilterDispatchContext = createContext<React.Dispatch<FilterAction> | null>(null)

export function useFilterList() {
  return useContext(FilterListContext);
}

export function useFilterDispatch() {
  return useContext(FilterDispatchContext);
}

interface FilterProviderProps {
  children: ReactNode
  initialFilter: ConditionalFilter
}

const ROOT_ID = '0'
function generateFilterId(): string {
  return Math.random().toString(36).substring(7)
}

function toFilterProps(filter: LogicalFilter): LogicalFilterProps {
  return {
    id: generateFilterId(),
    operator: filter.operator,
    operands: filter.operands
  }
}

type FilterPropsList = Record</* id */ string, FilterProps>

interface AddFilterAction {
  type: 'CREATE_FILTER'
  parentId: string
  params: Partial<FilterProps>
}

interface UpdateFilterActoin {
  type: 'UPDATE_FILTER'
  filterId: string
  params: Partial<FilterProps>
}

interface RemoveFilterAction {
  type: 'DELETE_FILTER'
  parentId: string
  filterId: string
}

export type FilterAction = AddFilterAction | UpdateFilterActoin | RemoveFilterAction

function createFilter(filterList: FilterPropsList, action: AddFilterAction): FilterPropsList {
  const parent = filterList[action.parentId]

  if (!parent) throw Error('Parent filter not found: ' + action.parentId)
  if (!isConditionalFilterProps(parent)) throw Error('Parent filter is not a conditional filter: ' + action.parentId)

  const newFilterProps = {
    id: generateFilterId(),
    ...action.params
  } as FilterProps

  return {
    ...filterList,
    [parent.id]: { ...parent, childIds: [...parent.childIds, newFilterProps.id] },
    [newFilterProps.id]: newFilterProps
  }
}

function updateFilter(filterList: FilterPropsList, action: UpdateFilterActoin): FilterPropsList {
  const filterProps = filterList[action.filterId]

  if (!filterProps) throw Error('Filter not found: ' + action.filterId)

  const newFilterProps = {
    ...filterProps,
    ...action.params
  } as FilterProps

  return {
    ...filterList,
    [action.filterId]: newFilterProps
  }
}

function deleteFilter(filterList: FilterPropsList, action: RemoveFilterAction): FilterPropsList {
  const {
    [action.filterId]: filterProps,
    [action.parentId]: parent,
    ...rest
  } = filterList

  if (!filterProps) throw Error('Filter not found: ' + action.filterId)
  if (!parent) throw Error('Parent filter not found: ' + action.parentId)

  if (!isConditionalFilterProps(parent)) throw Error('Parent filter is not a conditional filter: ' + action.parentId)

  return {
    ...rest,
    [action.parentId]: {
      ...parent,
      childIds: parent.childIds.filter((id) => id !== action.filterId)
    }
  }
}

function reducer(filterList: FilterPropsList, action: FilterAction): FilterPropsList {
  switch (action.type) {
    case 'CREATE_FILTER':
      return createFilter(filterList, action)
    case "UPDATE_FILTER":
      return updateFilter(filterList, action)
    case "DELETE_FILTER":
      return deleteFilter(filterList, action)
  }
}

function toFilterListProps(
  { filter, isRoot }: { filter: ConditionalFilter, isRoot?: boolean },
  acc?: FilterPropsList
): FilterPropsList {
  const filterList = acc ?? ({} as FilterPropsList)

  if (isConditionalFilter(filter)) {
    const childIds = filter.operands.flatMap((operand) => {
      if (isConditionalFilter(operand)) {
        const children = toFilterListProps({ filter: operand })

        return Object.entries(children).map(([childId, childProps]) => {
          filterList[childId] = childProps

          return childId
        })
      } else {
        const filterProps = toFilterProps(operand)
        filterList[filterProps.id] = filterProps

        return [filterProps.id]
      }
    })

    const filterProps = {
      id: isRoot ? ROOT_ID : generateFilterId(),
      operator: filter.operator,
      childIds
    }

    filterList[filterProps.id] = filterProps
  } else {
    const filterProps = toFilterProps(filter)

    filterList[filterProps.id] = filterProps
  }

  return filterList
}

export function getRootFilter(filterList: FilterPropsList): ConditionalFilterProps {
  const filter = filterList[ROOT_ID] as ConditionalFilterProps
  if (!filter) throw Error('Root filter not found')

  return filter
}

export default function FilterProvider(
  { children, initialFilter }: FilterProviderProps
) {
  const [filterList, dispatch] = useReducer(reducer, { filter: initialFilter, isRoot: true }, toFilterListProps)

  return (
    <FilterListContext.Provider value={filterList}>
      <FilterDispatchContext.Provider value={dispatch}>
        {children}
      </FilterDispatchContext.Provider>
    </FilterListContext.Provider>
  )
}
