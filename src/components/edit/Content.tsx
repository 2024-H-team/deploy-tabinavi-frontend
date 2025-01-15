import styles from '@styles/componentStyles/edit/Content.module.scss';
import EditFieldTime from './EditField';
import EditFieldPE from './EditFieldPE';
import EditFieldMemo from './EditFieldMemo';
import DeleteSchedule from '@/components/edit/DeleteSchedule';
import { PlaceDetails } from '@/types/PlaceDetails';

interface ContentProps {
    spot: PlaceDetails | undefined;
}

export default function Content({ spot }: ContentProps) {
    if (!spot) return null;

    return (
        <div className={styles.ContentWrap}>
            <EditFieldTime title="滞在時間" spot={spot} />
            <EditFieldPE title="持ち物" data={spot.packingList?.map((item) => ({ Name: item })) || []} />
            <EditFieldMemo title="メモ" value={spot.note || ''} placeId={spot.placeId} />
            <DeleteSchedule />
        </div>
    );
}
