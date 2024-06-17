import { Button } from "@radix-ui/themes";
import { useFilterDispatch } from "./FilterContext";

export default function RemoveFilter({ parentId, filterId }: { parentId: string | undefined; filterId: string }) {
  const dispatch = useFilterDispatch()

  // The root filter cannot be removed
  if (!parentId) return null

  return (
    <Button className="cursor-pointer" variant="soft" onClick={() => {
      dispatch!({
        type: 'DELETE_FILTER',
        parentId,
        filterId,
      });
    }}>Remove</Button>
  )
}
