'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import styles from '@styles/appStyles/auth/auth.module.scss';
import { AxiosError } from 'axios';
import Link from 'next/link';

interface RegisterFormData {
    userName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    fullName: string;
}

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterFormData>();

    const password = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setLoading(true);
            setError('');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...submitData } = data;
            await apiClient.post('/auth/register', submitData);
            setSuccess(true);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.errors[0].msg || 'エラーが発生しました');
            } else {
                setError('エラーが発生しました');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h1>新規アカウント作成</h1>
                </div>

                {success ? (
                    <div className={styles.successMessage}>
                        アカウントが作成されました。ログインしてください。
                        <Link href="/" style={{ color: '#059669', textDecoration: 'underline' }}>
                            ログイン
                        </Link>
                        .
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.formGroup}>
                            <label>ログインID</label>
                            <input
                                {...register('userName', {
                                    required: 'ログインIDは必須です',
                                    minLength: 3,
                                })}
                                className={errors.userName ? styles.error : ''}
                            />
                            {errors.userName && <p className={styles.errorText}>{errors.userName.message}</p>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>名前</label>
                            <input
                                {...register('fullName', {
                                    required: '名前は必須です',
                                })}
                                className={errors.fullName ? styles.error : ''}
                            />
                            {errors.fullName && <p className={styles.errorText}>{errors.fullName.message}</p>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>メールアドレス</label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'メールアドレスは必須です',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'メールアドレスが有効ではありません',
                                    },
                                })}
                                className={errors.email ? styles.error : ''}
                            />
                            {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>パスワード</label>
                            <input
                                type="password"
                                {...register('password', {
                                    required: 'パスワードが必要です',
                                    minLength: {
                                        value: 6,
                                        message: 'パスワードは6文字以上である必要があります',
                                    },
                                })}
                                className={errors.password ? styles.error : ''}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>パスワード確認</label>
                            <input
                                type="password"
                                {...register('confirmPassword', {
                                    required: '再確認のためにパスワードを入力してください',
                                    validate: (value) => value === password || 'パスワードが一致しません',
                                })}
                                className={errors.confirmPassword ? styles.error : ''}
                            />
                            {errors.confirmPassword && (
                                <p className={styles.errorText}>{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <button type="submit" disabled={loading} className={styles.submitButton}>
                            {loading ? '送信中' : '登録'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
