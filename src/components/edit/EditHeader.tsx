import { IoIosArrowBack } from 'react-icons/io';
import styles from '@styles/componentStyles/edit/EditHeader.module.scss';
import { useRouter } from 'next/navigation';
import { FaRegQuestionCircle } from 'react-icons/fa';

type Props = {
    location: string | null;
    onShowManual: () => void;
};

export default function EditHeader(props: Props) {
    const router = useRouter();

    const handleBack = () => {
        sessionStorage.removeItem('editSpot');
        router.push('/create-schedule/schedule-preview');
    };

    const handleQuestionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        props.onShowManual();
    };

    return (
        <header className={styles.header}>
            <FaRegQuestionCircle
                size={25}
                color="#f1f1f1"
                className={styles.questionBtn}
                onClick={handleQuestionClick}
            />
            <button onClick={handleBack}>
                <IoIosArrowBack size={18} color="white" />
            </button>
            <h1>{props.location}</h1>
        </header>
    );
}
