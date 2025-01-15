import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlaceDetails } from '@/types/PlaceDetails';

interface SortableSpotWrapperProps {
    spot: PlaceDetails;
    onDelete: () => void;
    onStayTimeUpdate: (spotName: string, stayTime: { hour: string; minute: string }) => void;
    children: (props: {
        dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
        isDragging: boolean;
    }) => React.ReactNode;
    className?: string;
}

export default function SortableSpotWrapper({ spot, children, className }: SortableSpotWrapperProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: spot.name,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div ref={setNodeRef} style={style} className={className}>
            {children({
                dragHandleProps: { ...attributes, ...listeners },
                isDragging: isDragging,
            })}
        </div>
    );
}
