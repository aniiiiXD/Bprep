import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Download,
  Pencil,
  Trash2,
  PlusSquare,
  Save
} from 'lucide-react';

// Axios instance with credentials
const api = axios.create({
  baseURL: 'https://bprep-backend-cikh309f6-aniiiixds-projects.vercel.app/api',
  withCredentials: true
});

// QuestionCard Component 
const QuestionCard = ({ question, onEdit, onDelete, onAnswerChange, onSubmit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question.question);
  const [answer, setAnswer] = useState(question.userAnswer || '');

  const handleEdit = async () => {
    try {
      await onEdit(question._id, editedQuestion);
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing question:", error);
    }
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    onAnswerChange(question._id, e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(question._id, answer);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <div className="flex items-center space-x-2 w-full">
            <input
              type="text"
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleEdit}
              className="text-green-500 hover:text-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-red-500 hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-800">
              {question.question}
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(question._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
      <textarea
        rows="4"
        value={answer}
        onChange={handleAnswerChange}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Write your answer here..."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Submit Answer</span>
        </button>
      </div>
    </div>
  );
};

// Main Interview Component
const Interview = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/questions/questions');
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error.response?.status === 401) {
        navigate('/');
      } else {
        setError("Failed to fetch questions. Please try again later.");
      }
      setLoading(false);
    }
  };

  // Download Answers
  const downloadAnswers = () => {
    const answersText = questions
      .map(q => `Question: ${q.question}\nAnswer: ${q.userAnswer || ''}`)
      .join('\n\n');
    const blob = new Blob([answersText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'interview_answers.txt';
    link.click();
  };

  // Edit Question
  const editQuestion = async (id, newText) => {
    try {
      const response = await api.put(`/questions/questions/${id}`, {
        question: newText
      });
      setQuestions(questions.map(q =>
        q._id === id ? response.data.question : q
      ));
    } catch (error) {
      console.error("Error editing question:", error);
    }
  };

  // Delete Question
  const deleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Update Answer
  const updateAnswer = async (id, newAnswer) => {
    try {
      const response = await api.put(`/questions/questions/${id}`, {
        userAnswer: newAnswer
      });
      setQuestions(questions.map(q =>
        q._id === id ? response.data.question : q
      ));
    } catch (error) {
      console.error("Error updating answer:", error);
    }
  };

  const addQuestion = async () => {
    const newQuestion = prompt("Enter your new interview question:");
    if (newQuestion?.trim()) {
      try {
        const response = await api.post('/questions/questions', {
          question: newQuestion
        });
        setQuestions([...questions, response.data.question]);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  const submitAnswer = async (id, answer) => {
    try {
      await api.put(`/questions/questions/${id}`, {
        userAnswer: answer,
        status: 'Completed'
      });
      // Show success message or update UI as needed
      alert('Answer submitted successfully!');
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        {error}
        <button
          onClick={fetchQuestions}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Interview Preparation</h1>
        <div className="flex space-x-4">
          <button
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-600"
          >
            <PlusSquare className="w-5 h-5" />
            <span>Add Question</span>
          </button>
          <button
            onClick={downloadAnswers}
            className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-green-600"
          >
            <Download className="w-5 h-5" />
            <span>Download Answers</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard
            key={question._id}
            question={question}
            onEdit={editQuestion}
            onDelete={deleteQuestion}
            onAnswerChange={updateAnswer}
            onSubmit={submitAnswer}
          />
        ))}
      </div>
    </div>
  );
};

export default Interview;