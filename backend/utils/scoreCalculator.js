export const calculateScore = async (test, studentAnswers) => {
    let marksObtained = 0;
    // Fallback to number of questions if totalMarks missing
    const computedTotalMarks = Number(test.totalMarks ?? (Array.isArray(test.questions) ? test.questions.length : 0)) || 0;

    console.log('Calculating score for test:', test._id);
    console.log('Student answers:', studentAnswers);
    console.log('Test questions:', test.questions?.length);

    // Calculate marks for each answer
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

        // Handle different answer types
        let isCorrect = false;
        
        if (question.type === 'mcq') {
            // For MCQ, compare string values
            isCorrect = String(question.correctAnswer) === String(answer.selectedAnswer);
        } else if (question.type === 'msq') {
            // For MSQ, compare arrays
            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
            const selectedAnswers = Array.isArray(answer.selectedAnswer) ? answer.selectedAnswer : [answer.selectedAnswer];
            isCorrect = correctAnswers.length === selectedAnswers.length && 
                       correctAnswers.every(ans => selectedAnswers.includes(ans));
        } else if (question.type === 'nat') {
            // For NAT, compare numeric values
            const correctNum = Number(question.correctAnswer);
            const selectedNum = Number(answer.selectedAnswer);
            isCorrect = !isNaN(correctNum) && !isNaN(selectedNum) && correctNum === selectedNum;
        }

        // Default marks to 1 if not provided on question
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

    // Calculate percentage (guard divide-by-zero)
    const percentage = computedTotalMarks > 0 ? (marksObtained / computedTotalMarks) * 100 : 0;

    // Determine pass/fail status (assuming 40% is passing)
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