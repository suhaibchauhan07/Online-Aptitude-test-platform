export const calculateScore = async (test, studentAnswers) => {
    let marksObtained = 0;
    const computedTotalMarks = Number(test.totalMarks ?? (Array.isArray(test.questions) ? test.questions.length : 0)) || 0;

    console.log('Calculating score for test:', test._id);
    console.log('Student answers:', studentAnswers);
    console.log('Test questions:', test.questions?.length);

    const answers = (studentAnswers || []).map(answer => {
        const question = (test.questions || []).find(q => q._id.toString() === answer.questionId);
        if (!question) {
            console.log('Question not found for ID:', answer.questionId);
            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: false,
                marksObtained: 0
            };
        }

        let isCorrect = false;
        const qType = (question.type || 'mcq').toString().toLowerCase();

        if (qType === 'mcq') {
            isCorrect = String(question.correctAnswer) === String(answer.selectedAnswer);
        } else if (qType === 'msq') {
            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
            const selectedAnswers = Array.isArray(answer.selectedAnswer) ? answer.selectedAnswer : [answer.selectedAnswer];
            isCorrect = correctAnswers.length === selectedAnswers.length && correctAnswers.every(ans => selectedAnswers.includes(ans));
        } else if (qType === 'nat') {
            const correctNum = Number(question.correctAnswer);
            const selectedNum = Number(answer.selectedAnswer);
            isCorrect = !isNaN(correctNum) && !isNaN(selectedNum) && correctNum === selectedNum;
        }

        const perQuestionMarks = Number(question?.marks ?? 1);
        const marks = isCorrect ? perQuestionMarks : 0;
        marksObtained += marks;

        console.log(`Question ${answer.questionId}: selected=${answer.selectedAnswer}, correct=${question.correctAnswer}, isCorrect=${isCorrect}, marks=${marks}`);

        return {
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
            marksObtained: Number(marks)
        };
    });

    const percentage = computedTotalMarks > 0 ? (marksObtained / computedTotalMarks) * 100 : 0;
    const status = percentage >= 40 ? 'pass' : 'fail';

    console.log(`Final score: ${marksObtained}/${computedTotalMarks} (${percentage.toFixed(2)}%)`);

    return {
        totalMarks: computedTotalMarks,
        marksObtained: Number(marksObtained),
        percentage: Number(percentage),
        status,
        answers
    };
};