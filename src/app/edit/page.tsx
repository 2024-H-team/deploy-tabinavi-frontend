'use client';
import Content from '@/components/edit/Content';
import EditHeader from '@/components/edit/EditHeader';
import { useEffect, useState } from 'react';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useRouter } from 'next/navigation';
import styles from '@styles/componentStyles/edit/EditHeader.module.scss';

export default function Edit() {
    const [spot, setSpot] = useState<PlaceDetails | undefined>(undefined);
    const [showManual, setShowManual] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedSpot = sessionStorage.getItem('editSpot');
        if (!savedSpot) {
            router.replace('/home');
            return;
        }
        setSpot(JSON.parse(savedSpot));
    }, [router]);

    useEffect(() => {
        const hasShownManual = localStorage.getItem('spotInfoManual');
        if (!hasShownManual) {
            setShowManual(true);
            localStorage.setItem('spotInfoManual', 'shown');
        }
    }, []);

    const handleCloseManual = () => {
        setShowManual(false);
    };

    return (
        <div
            style={{
                height: '100dvh',
                width: '100%',
                position: 'relative',
            }}
            onClick={handleCloseManual}
        >
            {showManual && (
                <div className={styles.manualDisplay}>
                    <div className={styles.spotInfoManualBox}>
                        <div className={styles.manualArrow}></div>
                        <div className={styles.manualText}>
                            ここに押したらスポットの滞在時間、持ち物リストなどの情報が自動的に保存されます。
                        </div>
                    </div>
                    <div className={styles.closeMess}>画面タッチして閉じる</div>
                </div>
            )}
            <EditHeader location={spot?.name || '未設定'} onShowManual={() => setShowManual(true)} />
            <Content spot={spot} />
        </div>
    );
}
