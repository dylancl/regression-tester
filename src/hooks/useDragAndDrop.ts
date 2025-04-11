import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TestStepDocument } from "../firebase/firestore";

export interface UseDragAndDropProps {
  items: TestStepDocument[];
  onReorder: (reorderedItems: TestStepDocument[]) => Promise<boolean>;
}

export const useDragAndDrop = ({ items, onReorder }: UseDragAndDropProps) => {
  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the old and new index
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Calculate the reordered list
      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      // Call the reorder handler
      await onReorder(reorderedItems);
    }
  };

  return {
    sensors,
    handleDragEnd,
  };
};

export default useDragAndDrop;
