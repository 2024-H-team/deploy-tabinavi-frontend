'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from '@styles/appStyles/profile/editProfile.module.scss';
import { IoIosArrowBack } from 'react-icons/io';
import { FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

export default function EditProfile() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('/sample-avatar.png');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [hasStartedConfirm, setHasStartedConfirm] = useState(false);
    const [hasStartedNewPassword, setHasStartedNewPassword] = useState(false);

    const [hasStartedUsername, setHasStartedUsername] = useState(false);
    const [hasStartedEmail, setHasStartedEmail] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUsername(user.fullName || '');
            setEmail(user.email || '');
            setAvatar(user.avatar || '/sample-avatar.png');
        }
    }, []);

    // Clear password-related fields when toggling
    useEffect(() => {
        if (!showPasswordFields) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setHasStartedNewPassword(false);
            setHasStartedConfirm(false);
        }
    }, [showPasswordFields]);

    const isValidPassword = (pass: string) => {
        // Must contain both letters and digits
        return /^(?=.*[A-Za-z])(?=.*\d).+$/.test(pass);
    };

    const handleChangeAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('ファイルサイズは5MB以下にしてください。');
                event.target.value = '';
                return;
            }
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
            if (!validTypes.includes(file.type)) {
                alert('PNG、JPEG、HEIC、HEIF形式の画像のみアップロード可能です。');
                event.target.value = '';
                return;
            }
            setSelectedFile(file);
            const tempUrl = URL.createObjectURL(file);
            setAvatar(tempUrl);
        }
    };

    const handleBack = () => {
        router.push('/profile');
    };

    const handleSave = async () => {
        if (!username) {
            alert('名前を入力してください');
            return;
        }
        if (!email) {
            alert('メールアドレスを入力してください');
            return;
        }

        if (showPasswordFields) {
            if (!currentPassword) {
                alert('現在のパスワードを入力してください');
                return;
            }
            if (!newPassword) {
                alert('新しいパスワードを入力してください');
                return;
            }
            if (!isValidPassword(newPassword)) {
                alert('新しいパスワードは文字と数字を含める必要があります');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('新しいパスワードが一致しません');
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append('fullName', username);
            formData.append('email', email);

            if (showPasswordFields) {
                formData.append('currentPassword', currentPassword);
                formData.append('newPassword', newPassword);
            }

            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            // Use PUT or PATCH as you like; here is PUT
            const response = await apiClient.put('/auth/update-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert('プロフィールが正常に更新されました');
                localStorage.setItem('user', JSON.stringify(response.data.data));
                router.push('/profile');
            } else {
                alert(response.data.message || '更新に失敗しました');
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error('Update profile error:', err);
                if (err.response?.data?.message === '現在のパスワードが間違っています') {
                    alert('現在のパスワードが間違っています');
                } else {
                    alert('サーバーエラーが発生しました');
                }
            } else {
                console.error('Unexpected error:', err);
                alert('予期しないエラーが発生しました');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    <IoIosArrowBack size={24} color="#333" />
                </button>
                <p className={styles.pageTitle}>ユーザー情報の編集</p>
                <button className={styles.saveButton} onClick={handleSave}>
                    保存
                </button>
            </div>

            <div className={styles.avatarWrapper}>
                <div className={styles.avatarContainer}>
                    <Image src={avatar} alt="User Avatar" className={styles.avatarImage} width={100} height={100} />
                    <button className={styles.avatarEditBtn} onClick={handleChangeAvatar}>
                        <FaCamera size={16} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg, image/jpg, image/png, image/heic, image/heif"
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            <div className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>名前：</label>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.inputField}
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (!hasStartedUsername) setHasStartedUsername(true);
                            }}
                        />
                    </div>
                    <span className={styles.confirmError}>
                        {hasStartedUsername && !username ? '名前を入力してください' : ''}
                    </span>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>メールアドレス：</label>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.inputField}
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (!hasStartedEmail) setHasStartedEmail(true);
                            }}
                        />
                    </div>
                    <span className={styles.confirmError}>
                        {hasStartedEmail && !email ? 'メールアドレスを入力してください' : ''}
                    </span>
                </div>
                <button
                    type="button"
                    className={styles.changePasswordBtn}
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                    {showPasswordFields ? 'パスワード変更をキャンセル' : 'パスワード変更'}
                </button>

                {showPasswordFields && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>現在のパスワード：</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={styles.inputField}
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>新しいパスワード：</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={styles.inputField}
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (!hasStartedNewPassword) setHasStartedNewPassword(true);
                                    }}
                                />
                            </div>
                            <span className={styles.confirmError}>
                                {hasStartedNewPassword && !isValidPassword(newPassword)
                                    ? 'パスワードは文字と数字を含める必要があります'
                                    : ''}
                            </span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>新しいパスワード（確認）：</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={styles.inputField}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (!hasStartedConfirm) setHasStartedConfirm(true);
                                    }}
                                />
                            </div>
                            <span className={styles.confirmError}>
                                {hasStartedConfirm && newPassword !== confirmPassword ? 'パスワードが一致しません' : ''}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
