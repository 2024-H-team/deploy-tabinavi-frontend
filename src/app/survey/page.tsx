'use client';
import React, { useEffect, useState } from 'react';
import styles from '@styles/appStyles/survey/survey.module.scss';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Choice = {
    id: number;
    text: string;
    order: number;
};

type QuestionType = 'single' | 'multiple' | 'priority';

type Question = {
    id: number;
    text: string;
    type: QuestionType;
    allow_priority: boolean;
    choices: Choice[];
};

type UserAnswer = {
    question_id: number;
    choice_id: number;
    priority?: number;
};

export default function SurveyPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [questionId: number]: number | number[] | number[] }>({});
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both questions and answers
                const [questionsRes, answersRes] = await Promise.all([
                    apiClient.get('/questions'),
                    apiClient.get('/answers'),
                ]);

                setQuestions(questionsRes.data.data || []);

                // Transform answers into state format
                if (answersRes.data.success && answersRes.data.data) {
                    const userAnswers = answersRes.data.data;
                    const formattedAnswers: { [key: number]: number | number[] } = {};

                    // Group answers by question
                    userAnswers.forEach((answer: UserAnswer) => {
                        const { question_id, choice_id, priority } = answer;

                        if (priority !== null && priority !== undefined) {
                            // Priority question
                            if (!formattedAnswers[question_id]) {
                                formattedAnswers[question_id] = [];
                            }
                            const arr = formattedAnswers[question_id] as number[];
                            arr[priority - 1] = choice_id;
                        } else {
                            // Single/Multiple choice
                            if (formattedAnswers[question_id]) {
                                // Multiple choice
                                if (Array.isArray(formattedAnswers[question_id])) {
                                    (formattedAnswers[question_id] as number[]).push(choice_id);
                                }
                            } else {
                                // Single choice or first multiple choice
                                const question = questionsRes.data.data.find((q: Question) => q.id === question_id);
                                formattedAnswers[question_id] = question?.type === 'single' ? choice_id : [choice_id];
                            }
                        }
                    });

                    setAnswers(formattedAnswers);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    // Single-choice
    const handleSingleChange = (questionId: number, choiceId: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
    };

    // Multiple-choice
    const handleMultipleChange = (questionId: number, choiceId: number, checked: boolean) => {
        setAnswers((prev) => {
            const current = prev[questionId] as number[] | undefined;
            if (!current) return { ...prev, [questionId]: [choiceId] };
            if (checked) return { ...prev, [questionId]: [...current, choiceId] };
            return { ...prev, [questionId]: current.filter((id) => id !== choiceId) };
        });
    };

    // Priority: click to toggle and reorder
    const handlePriorityToggle = (questionId: number, choiceId: number) => {
        setAnswers((prev) => {
            const current = (prev[questionId] as number[]) || [];
            if (current.includes(choiceId)) {
                return { ...prev, [questionId]: current.filter((id) => id !== choiceId) };
            }
            return { ...prev, [questionId]: [...current, choiceId] };
        });
    };

    // Submit
    const handleSubmit = async () => {
        try {
            const unansweredQuestions = questions.filter((q) => {
                const answer = answers[q.id];
                if (!answer) return true;
                if (q.type === 'single' && typeof answer !== 'number') return true;
                if (
                    (q.type === 'multiple' || q.type === 'priority') &&
                    (!Array.isArray(answer) || answer.length === 0)
                ) {
                    return true;
                }
                return false;
            });

            if (unansweredQuestions.length > 0) {
                alert(`未回答の質問があります:`);
                return;
            }
            const userAnswers: UserAnswer[] = [];

            questions.forEach((q) => {
                const answerValue = answers[q.id];
                if (q.type === 'single' && typeof answerValue === 'number') {
                    userAnswers.push({ question_id: q.id, choice_id: answerValue });
                }
                if (q.type === 'multiple' && Array.isArray(answerValue)) {
                    answerValue.forEach((choiceId) => {
                        userAnswers.push({ question_id: q.id, choice_id: choiceId });
                    });
                }
                if (q.type === 'priority' && Array.isArray(answerValue)) {
                    answerValue.forEach((choiceId, index) => {
                        userAnswers.push({
                            question_id: q.id,
                            choice_id: choiceId,
                            priority: index + 1,
                        });
                    });
                }
            });

            if (!userAnswers.length) {
                alert('アンケートを全て回答してください。');
                return;
            }

            const res = await apiClient.post('/answers', { answers: userAnswers });
            if (res.data?.success) {
                alert('アンケートが正常に送信されました。');

                if (res.data.data.isUpdate) {
                    router.push('/profile');
                } else {
                    router.push('/home');
                }
            } else {
                alert('アンケートの送信中にエラーが発生しました。');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred while submitting your answers.');
        }
    };

    if (!questions.length) {
        return;
    }
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>アンケート</h2>
                <p>
                    このアンケートは、AIによるおすすめの旅行スポットを最適化するために活用されます。
                    <br />
                    （後からプロフィール画面から回答を変更することができます。）
                </p>
            </div>
            <div className={styles.questionList}>
                {questions.map((q) => (
                    <div key={q.id} className={styles.questionBlock}>
                        <div className={styles.questionText}>{q.text}</div>
                        <div className={styles.choiceList}>
                            {q.type === 'single' &&
                                q.choices.map((choice) => (
                                    <div
                                        key={choice.id}
                                        className={`${styles.choiceItem} ${
                                            answers[q.id] === choice.id ? styles.selected : ''
                                        }`}
                                        onClick={() => handleSingleChange(q.id, choice.id)}
                                    >
                                        <div
                                            className={`${styles.choiceCircle} ${
                                                answers[q.id] === choice.id ? styles.selected : ''
                                            }`}
                                        ></div>
                                        <span className={styles.choiceText}>{choice.text}</span>
                                    </div>
                                ))}

                            {q.type === 'multiple' &&
                                q.choices.map((choice) => {
                                    const selected = Array.isArray(answers[q.id])
                                        ? (answers[q.id] as number[]).includes(choice.id)
                                        : false;
                                    return (
                                        <div
                                            key={choice.id}
                                            className={`${styles.choiceItem} ${selected ? styles.selected : ''}`}
                                            onClick={() => handleMultipleChange(q.id, choice.id, !selected)}
                                        >
                                            <div
                                                className={`${styles.choiceCircle} ${selected ? styles.selected : ''}`}
                                            ></div>
                                            <span className={styles.choiceText}>{choice.text}</span>
                                        </div>
                                    );
                                })}

                            {q.type === 'priority' &&
                                q.choices.map((choice) => {
                                    const current = (answers[q.id] as number[]) || [];
                                    const isSelected = current.includes(choice.id);
                                    const rank = current.indexOf(choice.id) + 1;
                                    return (
                                        <div
                                            key={choice.id}
                                            className={`${styles.choiceItem} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => handlePriorityToggle(q.id, choice.id)}
                                        >
                                            <div
                                                className={`${styles.choiceCircle} ${
                                                    isSelected ? styles.selected : ''
                                                }`}
                                            >
                                                {isSelected ? rank : ''}
                                            </div>
                                            <span className={styles.choiceText}>{choice.text}</span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
                <button className={styles.submitButton} onClick={handleSubmit}>
                    送信
                </button>
            </div>
        </div>
    );
}
