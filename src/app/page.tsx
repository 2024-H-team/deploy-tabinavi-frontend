'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import styles from '@styles/appStyles/auth/auth.module.scss';
import { AxiosError } from 'axios';
import Image from 'next/image';
interface LoginFormData {
    userName: string;
    password: string;
}

interface UserData {
    id: number;
    userName: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
}

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true);
            setError('');

            const response = await apiClient.post('/auth/login', data);
            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);
                document.cookie = `token=${token}; path=/; expires=${expirationDate.toUTCString()}`;
                const firstLoginData = localStorage.getItem('firstLoginData');
                const firstLoginUsers: UserData[] = firstLoginData ? JSON.parse(firstLoginData) : [];

                const existingUser = firstLoginUsers.find((u: UserData) => u.id === user.id);

                if (!existingUser) {
                    firstLoginUsers.push(user);
                    localStorage.setItem('firstLoginData', JSON.stringify(firstLoginUsers));
                    router.push('/survey');
                } else {
                    router.push('/home');
                }
                setError('');
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || 'Login failed');
                console.log(err.response?.data);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.formWrapper}>
                <div className={styles.logo}>
                    <Image className={styles.logoImg} src="/logo.png" alt="a" width={150} height={150} />
                </div>
                <div className={styles.header}>
                    <h1>ログイン</h1>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className={styles.formGroup}>
                        <label>ユーザー名</label>
                        <input
                            {...register('userName', {
                                required: 'ユーザー名は必須です',
                            })}
                            className={errors.userName ? styles.error : ''}
                        />
                        {errors.userName && <p className={styles.errorText}>{errors.userName.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>パスワード</label>
                        <input
                            type="password"
                            {...register('password', {
                                required: 'パスワードは必須です',
                            })}
                            className={errors.password ? styles.error : ''}
                        />
                        {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? '送信中' : 'ログイン'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.2rem' }}>
                        アカウントをお持ちでない場合は、
                        <Link href="/register" style={{ color: '#4f46e5' }}>
                            こちら
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
