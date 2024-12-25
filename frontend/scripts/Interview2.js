import { ApiService } from './services/api.service.js';
import { QuestionComponent } from './components/QuestionComponent.js';

class InterviewApp {
  constructor() {
    this.questions = [];
    this.components = new Map();
    this.form = document.getElementById('interviewForm');
    this.init();
  }

  async init() {
    try {
      this.questions = await ApiService.fetchQuestions();
      this.renderQuestions();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize interview app:', error);
      alert('Failed to load questions. Please refresh the page.');
    }
  }

  renderQuestions() {
    this.form.innerHTML = '';
    this.questions.forEach(question => {
      const component = new QuestionComponent(question);
      this.components.set(question._id, component);
      
      // Setup component event listeners
      component.on('answer-change', this.handleAnswerChange.bind(this));
      component.on('answer-save', this.handleAnswerSave.bind(this));
      component.on('edit', this.handleQuestionEdit.bind(this));
      component.on('delete', this.handleQuestionDelete.bind(this));
      component.on('followup-change', this.handleFollowupChange.bind(this));
      
      this.form.appendChild(component.render());
    });
  }

  setupEventListeners() {
    // Global event listeners
    document.getElementById('downloadBtn')?.addEventListener('click', this.handleDownload.bind(this));
    document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout.bind(this));
  }

  async handleAnswerChange({ questionId, answer }) {
    const question = this.questions.find(q => q._id === questionId);
    if (question) {
      question.userAnswer = answer;
    }
  }

  async handleAnswerSave({ questionId, answer }) {
    try {
      // Implement save logic here
      console.log('Saving answer for question:', questionId, answer);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  }

  async handleQuestionEdit(question) {
    // Implement edit logic
    console.log('Editing question:', question);
  }

  async handleQuestionDelete(question) {
    try {
      // Implement delete logic
      const component = this.components.get(question._id);
      if (component) {
        component.element.remove();
        this.components.delete(question._id);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  }

  handleFollowupChange({ questionId, followUpIndex, answer }) {
    // Implement follow-up answer change logic
    console.log('Follow-up answer changed:', questionId, followUpIndex, answer);
  }

  async handleLogout() {
    try {
      await ApiService.logout();
      window.location.href = '../base.html';
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to logout. Please try again.');
    }
  }

  handleDownload() {
    // PDF download logic is already implemented in the HTML file
    console.log('Downloading answers...');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new InterviewApp();
});