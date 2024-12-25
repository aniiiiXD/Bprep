// questionsApi.js

const API_BASE_URL = 'http://localhost:3003/api/questions'; // Adjust the port if necessary

// Fetch all questions for the user
async function fetchQuestions() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            credentials: 'include', // Include cookies for session management
        });
        const data = await response.json();
        if (data.success) {
            renderQuestions(data.questions);
        } else {
            console.error('Failed to fetch questions:', data.message);
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Add a new question
async function addQuestion() {
    const newQuestionText = prompt("Enter your new interview question:");
    if (newQuestionText && newQuestionText.trim()) {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ question: newQuestionText }),
            });
            const data = await response.json();
            if (data.success) {
                renderQuestions([data.question], true);
            } else {
                console.error('Failed to add question:', data.message);
            }
        } catch (error) {
            console.error('Error adding question:', error);
        }
    }
}

// Update a question
async function updateQuestion(questionId, updatedText) {
    try {
        const response = await fetch(`${API_BASE_URL}/${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userAnswer: updatedText }),
        });
        const data = await response.json();
        if (!data.success) {
            console.error('Failed to update question:', data.message);
        }
    } catch (error) {
        console.error('Error updating question:', error);
    }
}

// Delete a question
async function deleteQuestion(questionId, questionElement) {
    try {
        const response = await fetch(`${API_BASE_URL}/${questionId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
            questionElement.remove();
        } else {
            console.error('Failed to delete question:', data.message);
        }
    } catch (error) {
        console.error('Error deleting question:', error);
    }
}

// Render questions in the DOM
function renderQuestions(questions, append = false) {
    const questionsContainer = document.getElementById('questionsContainer');
    if (!append) {
        questionsContainer.innerHTML = ''; // Clear existing questions
    }

    questions.forEach(question => {
        const questionCard = document.createElement('div');
        questionCard.className = 'bg-white rounded-lg shadow-md p-6 mb-4 transition-all duration-300 hover:shadow-lg';
        questionCard.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <label class="text-sm font-medium text-gray-800">${question.question}</label>
                <div class="flex space-x-2">
                    <button class="text-blue-500 hover:text-blue-700 transition" onclick="editQuestion('${question._id}', this)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                        </svg>
                    </button>
                    <button class="text-red-500 hover:text-red-700 transition" onclick="deleteQuestion('${question._id}', this.parentElement.parentElement.parentElement)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                    </button>
                </div>
            </div>
            <textarea rows="4" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Craft your answer here..." onblur="updateQuestion('${question._id}', this.value)">${question.userAnswer || ''}</textarea>
        `;
        questionsContainer.appendChild(questionCard);
    });
}

// Initialize the page by fetching questions
document.addEventListener('DOMContentLoaded', fetchQuestions);