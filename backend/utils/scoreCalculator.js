export const calculateScore = async (test, studentAnswers) => {
    let marksObtained = 0;
    // Compute total marks from per-question marks when available, else fallback
    const questionList = Array.isArray(test.questions) ? test.questions : []
    const perQuestionTotal = questionList.reduce((acc, q) => acc + Number(q?.marks ?? 1), 0)
    const computedTotalMarks = Number(test.totalMarks ?? perQuestionTotal) || perQuestionTotal || 0;

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
        const qType = question.type || 'mcq'
        
        if (qType === 'mcq' || qType === 'MCQ') {
            // For MCQ, compare string values
            isCorrect = String(question.correctAnswer) === String(answer.selectedAnswer);
        } else if (qType === 'msq' || qType === 'MSQ') {
            // For MSQ, compare arrays
            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
            const selectedAnswers = Array.isArray(answer.selectedAnswer) ? answer.selectedAnswer : [answer.selectedAnswer];
            isCorrect = correctAnswers.length === selectedAnswers.length && 
                       correctAnswers.every(ans => selectedAnswers.includes(ans));
        } else if (qType === 'nat' || qType === 'NAT') {
            // For NAT, compare numeric values
            const correctNum = Number(question.correctAnswer);
            const selectedNum = Number(answer.selectedAnswer);
            isCorrect = !isNaN(correctNum) && !isNaN(selectedNum) && correctNum === selectedNum;
        }

        // Marks per question
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