import { ApiService } from '../services/api.service.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class QuestionComponent extends EventEmitter {
  constructor(question) {
    super();
    this.question = question;
    this.element = null;
    this.followUpContainer = null;
  }

  render() {
    const div = document.createElement('div');
    div.className = 'space-y-2 relative';
    div.innerHTML = `
      <span class="flex justify-between items-center">
        <label class="block text-sm font-medium text-gray-900">
          ${this.question.question}
        </label>
        <div class="flex items-center space-x-2">
          <button class="edit-btn bg-gray-200 hover:bg-gray-300 shadow hover:shadow-md transition-all duration-200 p-2 rounded group relative">
            <img src="./pencil-line.svg" alt="edit" class="w-4 h-4">
            <span class="tooltip">Edit Question</span>
          </button>
          <button class="delete-btn bg-red-100 hover:bg-red-200 shadow hover:shadow-md transition-all duration-200 p-2 rounded group relative">
            <img src="./trash-2.svg" alt="delete" class="w-4 h-4">
            <span class="tooltip">Delete Question</span>
          </button>
        </div>
      </span>
      <textarea class="question-textarea w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-red-500 focus:border-red-500" rows="4">${this.question.userAnswer || ''}</textarea>
      <div class="flex justify-end items-center mt-2">
        <button class="generate-followups-btn bg-blue-100 hover:bg-blue-200 p-2 rounded-full group transition-all duration-200 hover:shadow-md">
          <img src="./arrow-big-right-dash.svg" alt="generate" class="w-6 h-6">
          <span class="tooltip">Generate Followups</span>
        </button>
      </div>
      <div class="follow-up-container mt-4 hidden"></div>
    `;

    this.element = div;
    this.followUpContainer = div.querySelector('.follow-up-container');
    this.attachEventListeners();
    return div;
  }

  attachEventListeners() {
    const generateBtn = this.element.querySelector('.generate-followups-btn');
    const textarea = this.element.querySelector('.question-textarea');
    const editBtn = this.element.querySelector('.edit-btn');
    const deleteBtn = this.element.querySelector('.delete-btn');

    generateBtn.addEventListener('click', this.handleGenerateClick.bind(this));
    textarea.addEventListener('input', this.handleTextareaInput.bind(this));
    textarea.addEventListener('blur', this.handleTextareaBlur.bind(this));
    editBtn.addEventListener('click', this.handleEditClick.bind(this));
    deleteBtn.addEventListener('click', this.handleDeleteClick.bind(this));
  }

  async handleGenerateClick() {
    const textarea = this.element.querySelector('.question-textarea');
    const answer = textarea.value.trim();
    
    if (!answer) {
      alert('Please provide an answer before generating follow-up questions.');
      return;
    }

    try {
      const followUps = await ApiService.generateFollowUps(
        this.question.question,
        answer
      );
      this.renderFollowUps(followUps);
    } catch (error) {
      console.error('Error generating follow-ups:', error);
      alert('Failed to generate follow-up questions. Please try again.');
    }
  }

  handleTextareaInput(event) {
    this.emit('answer-change', {
      questionId: this.question._id,
      answer: event.target.value
    });
  }

  async handleTextareaBlur(event) {
    try {
      const answer = event.target.value;
      await ApiService.updateQuestion(this.question._id, { userAnswer: answer });
      this.emit('answer-save', {
        questionId: this.question._id,
        answer: answer
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
      alert('Failed to save answer. Please try again.');
    }
  }

  async handleEditClick() {
    // Implement edit functionality based on your UI requirements
    // This might involve opening a modal or inline edit mode
    this.emit('edit', this.question);
  }

  async handleDeleteClick() {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await ApiService.deleteQuestion(this.question._id);
        this.emit('delete', this.question);
      } catch (error) {
        console.error('Failed to delete question:', error);
        alert('Failed to delete question. Please try again.');
      }
    }
  }

  renderFollowUps(followUps) {
    this.followUpContainer.innerHTML = followUps.map((q, index) => `
      <div class="follow-up-question ml-6 mt-4" data-index="${index}" data-follow-up-id="${q._id || ''}">
        <p class="text-sm font-medium text-gray-700 mb-2">Follow-up ${index + 1}: ${q.question}</p>
        <textarea class="follow-up-answer w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-red-500 focus:border-red-500" rows="3">${q.answer || ''}</textarea>
        <div class="flex space-x-2 mt-2">
          <button class="edit-followup-btn text-sm text-blue-600">Edit</button>
          <button class="delete-followup-btn text-sm text-red-600">Delete</button>
        </div>
      </div>
    `).join('');

    // Add event listeners to follow-up textareas and buttons
    this.followUpContainer.querySelectorAll('.follow-up-answer').forEach((textarea, index) => {
      textarea.addEventListener('input', (event) => {
        this.emit('followup-change', {
          questionId: this.question._id,
          followUpIndex: index,
          answer: event.target.value
        });
      });
    });

    this.followUpContainer.querySelectorAll('.edit-followup-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => this.handleEditFollowUp(index));
    });

    this.followUpContainer.querySelectorAll('.delete-followup-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => this.handleDeleteFollowUp(index));
    });

    this.followUpContainer.classList.remove('hidden');
  }

  async handleEditFollowUp(index) {
    const followUpContainer = this.followUpContainer.querySelector(`.follow-up-question[data-index="${index}"]`);
    const followUpId = followUpContainer.dataset.followUpId;
    const textarea = followUpContainer.querySelector('.follow-up-answer');
    
    try {
      await ApiService.updateFollowUp(this.question._id, followUpId, {
        answer: textarea.value
      });
      alert('Follow-up updated successfully');
    } catch (error) {
      console.error('Failed to update follow-up:', error);
      alert('Failed to update follow-up. Please try again.');
    }
  }

  async handleDeleteFollowUp(index) {
    const followUpContainer = this.followUpContainer.querySelector(`.follow-up-question[data-index="${index}"]`);
    const followUpId = followUpContainer.dataset.followUpId;
    
    if (confirm('Are you sure you want to delete this follow-up question?')) {
      try {
        await ApiService.deleteFollowUp(this.question._id, followUpId);
        followUpContainer.remove();
      } catch (error) {
        console.error('Failed to delete follow-up:', error);
        alert('Failed to delete follow-up. Please try again.');
      }
    }
  }
}