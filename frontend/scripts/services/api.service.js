
const API_BASE_URL = 'http://localhost:3003/api';
export const ApiService = {
  async fetchQuestions(type = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/questions${type ? `?type=${type}` : ''}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },
 
  async generateFollowUps(question, answer, numberOfFollowUps = 3) {
    try {
      const response = await fetch(`${API_BASE_URL}/inter/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question, answer, numberOfFollowUps })
      });
      if (!response.ok) throw new Error('Failed to generate follow-ups');
      const data = await response.json();
      return data.followUpQuestions || [];
    } catch (error) {
      console.error('Error generating follow-ups:', error);
      return [];
    }
  },

  async updateQuestion(questionId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update question');
      return await response.json();
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  async deleteQuestion(questionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/questions/${questionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete question');
      return await response.json();
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  async addFollowUp(questionId, followUpData) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/questions/${questionId}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(followUpData)
      });
      if (!response.ok) throw new Error('Failed to add follow-up');
      return await response.json();
    } catch (error) {
      console.error('Error adding follow-up:', error);
      throw error;
    }
  },

  async updateFollowUp(questionId, followUpId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/questions/${questionId}/followups/${followUpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update follow-up');
      return await response.json();
    } catch (error) {
      console.error('Error updating follow-up:', error);
      throw error;
    }
  },

  async deleteFollowUp(questionId, followUpId) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/questions/${questionId}/followups/${followUpId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete follow-up');
      return await response.json();
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      throw error;
    }
  }
};