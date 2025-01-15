import { IoIosArrowBack } from 'react-icons/io';
import styles from '@styles/componentStyles/edit/EditHeader.module.scss';
import { useRouter } from 'next/navigation';

type Props = {
    location: string | null;
};

export default function EditHeader(props: Props) {
    const router = useRouter();

    const handleBack = () => {
        sessionStorage.removeItem('editSpot');
        router.push('/create-schedule/schedule-preview');
    };

    return (
        <header className={styles.header}>
            <button onClick={handleBack}>
                <IoIosArrowBack size={18} color="white" />
            </button>
            <h1>{props.location}</h1>
        </header>
    );
}
