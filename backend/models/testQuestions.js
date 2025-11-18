import mongoose from "mongoose";

const testQuestionsSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4; // Must have exactly 4 options
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  }
});

const TestQuestions = mongoose.model("TestQuestions", testQuestionsSchema);

export default TestQuestions;

