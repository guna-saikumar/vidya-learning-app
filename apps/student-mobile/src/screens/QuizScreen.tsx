import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { QuizQuestionCard, QuizTimer } from '../components/quiz';
import { getQuizById, saveQuizAttempt } from '../services/quizService';
import { RootStackParamList } from '../types/navigation';
import { QuizAttempt } from '../types/quiz';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export const QuizScreen: React.FC<Props> = ({ route, navigation }) => {
  const { quizId } = route.params;
  const quiz = getQuizById(quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const startTimeRef = useRef(Date.now());

  const totalQuestions = quiz ? quiz.questions.length : 0;
  const answeredCount = Object.keys(answers).length;

  // Intercept all back and screen exit attempts (Header back button, Android back, BottomNav, gestures)
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
      // If quiz is finished and navigating to results, allow navigation
      if (isFinished) {
        return;
      }

      // Prevent immediate exit
      e.preventDefault();

      // Show alert asking user about their quiz progress
      Alert.alert(
        'Exit Quiz?',
        `You have answered ${answeredCount} of ${totalQuestions} questions. Do you want to continue the quiz or exit? Your current attempt will not be saved.`,
        [
          {
            text: 'Continue Quiz',
            style: 'cancel',
            onPress: () => {
              // Stay on current quiz screen
            },
          },
          {
            text: 'Exit Quiz',
            style: 'destructive',
            onPress: () => {
              // Allow navigation to proceed
              navigation.dispatch(e.data.action);
            },
          },
        ],
        { cancelable: true }
      );
    });

    return beforeRemoveListener;
  }, [navigation, isFinished, answeredCount, totalQuestions]);

  const finishQuiz = useCallback(async () => {
    if (!quiz) return;

    setTimerRunning(false);
    setIsFinished(true);

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correctCount = 0;

    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const attempt: QuizAttempt = {
      quizId: quiz.id,
      answers,
      score,
      totalQuestions,
      correctCount,
      timeTakenSeconds: timeTaken,
      completedAt: Date.now(),
      passed: score >= quiz.passingScore,
    };

    await saveQuizAttempt(attempt);

    navigation.replace('QuizResult', {
      quizId: quiz.id,
      score,
      correctCount,
      totalQuestions,
      timeTaken,
      passed: score >= quiz.passingScore,
    });
  }, [answers, quiz, navigation, totalQuestions]);

  if (!quiz) {
    return (
      <View className="flex-1 bg-white">
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Quiz Not Found" />
        <View className="flex-1 items-center justify-center gap-2">
          <MaterialIcons name="error-outline" size={48} color={Colors.textMuted} />
          <Text className="font-manrope-extrabold text-base text-textPrimary">Quiz not available</Text>
          <Text className="font-manrope-medium text-xs text-textMuted">This quiz hasn't been created yet.</Text>
        </View>
        <BottomNav activeTab="Tasks" navigation={navigation} />
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];

  const handleSelectAnswer = (index: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }));
  };

  const handleCheckAnswer = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setShowExplanation(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTimeUp = () => {
    Alert.alert('Time\'s Up!', 'The allocated quiz time has ended. Your current answers will be submitted.', [
      { text: 'View Results', onPress: finishQuiz },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Header with Back button and Quiz Title */}
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={quiz.title}
        subtitle={`${quiz.subjectName} · ${quiz.chapterTitle}`}
        rightAction={
          <TouchableOpacity
            className="bg-primary px-3.5 py-1.5 rounded-full shadow-sm"
            onPress={finishQuiz}
            activeOpacity={0.8}
          >
            <Text className="font-manrope-bold text-xs text-white">
              Finish ({answeredCount}/{totalQuestions})
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Timer and Question Tracker Bar */}
      <View className="bg-[#FAF7F4] px-5 py-2.5 border-b border-border flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <QuizTimer
            totalSeconds={quiz.timeLimitMinutes * 60}
            isRunning={timerRunning}
            onTimeUp={handleTimeUp}
          />
        </View>

        <View className="bg-palePeach px-2.5 py-1 rounded-full border border-primary/20">
          <Text className="font-manrope-extrabold text-[11px] text-primary">
            {answeredCount}/{totalQuestions} Answered
          </Text>
        </View>
      </View>

      {/* Question Selector Strip (Jump directly to any question) */}
      <View className="bg-white border-b border-border px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {quiz.questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q.id] !== undefined;

            return (
              <TouchableOpacity
                key={q.id}
                className={`w-8 h-8 rounded-full items-center justify-center border ${
                  isCurrent
                    ? 'bg-primary border-primary'
                    : isAnswered
                    ? 'bg-palePeach border-primary/40'
                    : 'bg-white border-border'
                }`}
                onPress={() => {
                  setShowExplanation(false);
                  setCurrentIndex(idx);
                }}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-manrope-bold text-xs ${
                    isCurrent
                      ? 'text-white'
                      : isAnswered
                      ? 'text-primary'
                      : 'text-textSecondary'
                  }`}
                >
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Question Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <QuizQuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={selectedAnswer}
          isSubmitted={showExplanation}
          onSelectAnswer={handleSelectAnswer}
        />

        {/* Action Buttons */}
        <View className="flex-row gap-3 pt-2">
          {currentIndex > 0 ? (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3.5 rounded-2xl border border-border bg-white shadow-sm"
              onPress={handlePrevious}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={18} color={Colors.textPrimary} />
              <Text className="font-manrope-bold text-xs text-textPrimary">Previous</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3.5 rounded-2xl border border-border bg-white opacity-40"
              disabled
            >
              <MaterialIcons name="arrow-back" size={18} color={Colors.textMuted} />
              <Text className="font-manrope-bold text-xs text-textMuted">Previous</Text>
            </TouchableOpacity>
          )}

          {!showExplanation ? (
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-3.5 rounded-2xl shadow-sm ${
                selectedAnswer !== undefined ? 'bg-primary' : 'bg-[#E3DCD5]'
              }`}
              onPress={handleCheckAnswer}
              disabled={selectedAnswer === undefined}
              activeOpacity={0.85}
            >
              <Text
                className={`font-manrope-bold text-xs ${
                  selectedAnswer !== undefined ? 'text-white' : 'text-textMuted'
                }`}
              >
                Check Answer
              </Text>
              <MaterialIcons
                name="check"
                size={18}
                color={selectedAnswer !== undefined ? Colors.white : Colors.textMuted}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-primary shadow-sm"
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text className="font-manrope-bold text-xs text-white">
                {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
              </Text>
              <MaterialIcons
                name={currentIndex < totalQuestions - 1 ? 'arrow-forward' : 'flag'}
                size={18}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab="Tasks" navigation={navigation} />
    </View>
  );
};
