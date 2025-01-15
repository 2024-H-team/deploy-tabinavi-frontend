'use client';
import Content from '@/components/edit/Content';
import EditHeader from '@/components/edit/EditHeader';
import { useEffect, useState } from 'react';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useRouter } from 'next/navigation';

export default function Edit() {
    const [spot, setSpot] = useState<PlaceDetails | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        const savedSpot = sessionStorage.getItem('editSpot');
        if (!savedSpot) {
            router.replace('/home');
            return;
        }
        setSpot(JSON.parse(savedSpot));
    }, [router]);

    return (
        <div>
            <EditHeader location={spot?.name || '未設定'} />
            <Content spot={spot} />
        </div>
    );
}
