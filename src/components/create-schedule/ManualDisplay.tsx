import styles from '@styles/appStyles/schedule/SchedulePreview.module.scss';

export default function ManualDisplay() {
    return (
        <div className={styles.manualDisplay}>
            <div className={styles.spotInfoManualBox}>
                <div className={styles.manualArrow}></div>
                <div className={styles.manualText}>
                    ここに押したらスポットの滞在時間、持ち物リストなどを編集することができます。
                </div>
            </div>
            <div className={styles.spotTransportManualBox}>
                <div className={styles.manualArrow}></div>
                <div className={styles.manualText}>
                    ここに押したら移動手段を選択し、移動時間を計算することができます。
                </div>
            </div>
            <div className={styles.spotTransitManualBox}>
                <div className={styles.manualArrow}></div>
                <div className={styles.manualText}>電車の場合、ここに路線を見ることができます。</div>
            </div>
            <div className={styles.closeMess}>画面タッチして閉じる</div>
        </div>
    );
}
