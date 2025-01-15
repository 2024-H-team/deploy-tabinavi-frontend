import styles from '@styles/componentStyles/Footer.module.scss';
import { GoHome } from 'react-icons/go';
import { PiPlusSquareBold } from 'react-icons/pi';
import { BsClockHistory } from 'react-icons/bs';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className={styles.FooterWrap}>
            <Link className={styles.NavBtn} href={'/home'}>
                <GoHome color="white" size="24px" />
                <p>Home</p>
            </Link>
            <Link className={styles.NavBtn} href={'/create-schedule'}>
                <PiPlusSquareBold color="white" size="24px" />
                <p>New schedule</p>
            </Link>
            <Link className={styles.NavBtn} href={'/profile'}>
                <BsClockHistory color="white" size="24px" />
                <p>Profile</p>
            </Link>
        </footer>
    );
}
