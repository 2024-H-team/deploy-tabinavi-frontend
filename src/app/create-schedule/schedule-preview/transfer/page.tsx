'use client';
import { useEffect, useState } from 'react';
import styles from '@styles/appStyles/schedule/transferPage.module.scss';
import { BestRoute } from '@/types/TransferData';
import { useRouter } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import { FaTrainSubway } from 'react-icons/fa6';
import { MdPlace } from 'react-icons/md';

export default function Page() {
    const router = useRouter();

    const [transferData, setTransferData] = useState<BestRoute | null>(null);

    useEffect(() => {
        const data = sessionStorage.getItem('transferData');
        if (data) {
            setTransferData(JSON.parse(data));
            // sessionStorage.removeItem('transferData');
        }
    }, []);

    if (!transferData) {
        return <p className={styles.error}>データが見つかりません。</p>;
    }

    const { route, transfers } = transferData;
    let currentLine: string | null = null;

    const renderRoute = () => {
        return route.map((segment, index) => {
            const elements = [];
            const isLastSegment = index === route.length - 1;

            if (index === 0) {
                elements.push(
                    <div key={`from-${index}`} className={styles.start}>
                        <div className={styles.startIcon}>
                            <FaTrainSubway size={22} />
                        </div>
                        <div className={styles.bar}></div>
                        {segment.from_name}
                    </div>,
                );
                elements.push(
                    <div key={`line-${index}`} className={styles.routeLine}>
                        ({segment.line})<div className={styles.bar}></div>
                    </div>,
                );
                currentLine = segment.line;
                elements.push(
                    <div key={`to-${index}`} className={isLastSegment ? styles.end : styles.routeItem}>
                        {segment.to_name}
                        <div className={styles.bar}></div>
                        <div className={styles.dot}></div>
                    </div>,
                );
            } else {
                if (segment.line !== currentLine) {
                    const transfer = transfers.find((t) => t.from_line === currentLine && t.to_line === segment.line);
                    if (transfer) {
                        elements.push(
                            <div key={`transfer-${index}`} className={styles.routeItemTransfer}>
                                <strong>{transfer.to_line}に乗り換え</strong>
                                <div className={styles.dotContainer}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>,
                        );
                        elements.push(
                            <div key={`from-${index}`} className={styles.start}>
                                <div className={styles.startIcon}>
                                    <FaTrainSubway size={22} />
                                </div>
                                <div className={styles.bar}></div>
                                {segment.from_name}
                            </div>,
                        );
                        elements.push(
                            <div key={`line-${index}`} className={styles.routeLine}>
                                ({segment.line})<div className={styles.bar}></div>
                            </div>,
                        );
                    }
                    currentLine = segment.line;
                }

                elements.push(
                    <div key={`to-${index}`} className={isLastSegment ? styles.end : styles.routeItem}>
                        {segment.to_name}
                        <div className={styles.bar}></div>
                        {isLastSegment ? (
                            <div className={styles.endIcon}>
                                <MdPlace size={30} color="red" />
                            </div>
                        ) : (
                            <div className={styles.dot}></div>
                        )}
                    </div>,
                );
            }

            return elements;
        });
    };

    const truncateTitle = (title: string, maxLength: number = 15) => {
        return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    };

    const handleBack = () => {
        sessionStorage.removeItem('transferData');
        router.push('/create-schedule/schedule-preview');
    };

    const getStationNames = () => {
        if (!transferData || !transferData.route.length) return '';

        const startStation = transferData.route[0].from_name;
        const lastIndex = transferData.route.length - 1;
        const endStation = transferData.route[lastIndex].to_name;

        return `${startStation}駅 ➞ ${endStation}駅`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateNav}>
                <div className={styles.header}>
                    <IoIosArrowBack color="white" size={30} className={styles.back} onClick={handleBack} />
                    <div className={styles.title}>{truncateTitle(getStationNames())}</div>
                </div>
                <div className={styles.dateSelect}>
                    <div className={styles.active}>ルート1</div>
                    <div>ルート2</div>
                    <div>ルート3</div>
                    <div>ルート4</div>
                </div>
            </div>
            <div className={styles.result}>{renderRoute()}</div>
        </div>
    );
}
