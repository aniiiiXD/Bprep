document.addEventListener("DOMContentLoaded", () => {
  const apiBaseUrl = "/api"; // Base URL for the APIs
  const questionList = document.getElementById("question-list");
  const followUpList = document.getElementById("followup-list");
  const questionForm = document.getElementById("question-form");
  const followUpForm = document.getElementById("followup-form");
 
  /** 
   * Utility: Fetch Wrapper
   */
  async function fetchApi(url, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    const options = { method, headers };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${apiBaseUrl}${url}`, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(data.message || "API call failed");
      throw new Error(data.message || "API call failed");
    }

    return data;
  }

  /**
   * Load Questions for the Current User
   */
  async function loadQuestions() {
    try {
      const { questions } = await fetchApi("/interview-questions");

      questionList.innerHTML = questions.map((q) => `
        <li data-id="${q._id}">
          <strong>${q.question}</strong>
          <p>${q.userAnswer || "No answer yet"}</p>
          <button data-action="view-followups">View Follow-Ups</button>
        </li>
      `).join("");
    } catch (error) {
      console.error("Error loading questions:", error.message);
    }
  }

  /**
   * Load Follow-Ups for a Question
   */
  async function loadFollowUps(questionId) {
    try {
      const { followUps } = await fetchApi(`/interview-followup`);
      followUpList.innerHTML = followUps.map((fu) => `
        <li data-id="${fu._id}">
          <strong>${fu.question}</strong>
          <p>${fu.answer || "No answer yet"}</p>
          <button data-action="edit-followup">Edit</button>
        </li>
      `).join("");
    } catch (error) {
      console.error("Error loading follow-ups:", error.message);
    }
  }

  /**
   * Add New Question
   */
  async function addQuestion(question, answer) {
    try {
      await fetchApi("/interview", "POST", { question, answer });
      await loadQuestions();
    } catch (error) {
      console.error("Error adding question:", error.message);
    }
  }

  /**
   * Add Follow-Up Question
   */
  async function addFollowUp(questionId, questionText) {
    try {
      await fetchApi(`/questions/${questionId}/followups`, "POST", { question: questionText });
      await loadFollowUps(questionId);
    } catch (error) {
      console.error("Error adding follow-up:", error.message);
    }
  }

  /**
   * Submit Answers to Follow-Ups
   */
  async function submitFollowUpAnswers(questionId, answers) {
    try {
      await fetchApi(`/interview-followup`, "POST", { answers });
      await loadFollowUps(questionId);
    } catch (error) {
      console.error("Error submitting follow-up answers:", error.message);
    }
  }

  /**
   * Event Handlers
   */

  // Handle adding a new question
  questionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = questionForm.elements["question"].value;
    const answer = questionForm.elements["answer"].value;
    await addQuestion(question, answer);
    questionForm.reset();
  });

  // Handle adding a follow-up question
  followUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const questionId = followUpForm.dataset.questionId;
    const followUpText = followUpForm.elements["followup"].value;
    await addFollowUp(questionId, followUpText);
    followUpForm.reset();
  });

  // Handle clicks on question list (e.g., view follow-ups)
  questionList.addEventListener("click", async (e) => {
    const button = e.target;
    const li = button.closest("li");
    const questionId = li.dataset.id;

    if (button.dataset.action === "view-followups") {
      followUpForm.dataset.questionId = questionId; // Attach questionId to form
      await loadFollowUps(questionId);
    }
  });

  // Handle clicks on follow-up list (e.g., edit follow-ups)
  followUpList.addEventListener("click", async (e) => {
    const button = e.target;
    const li = button.closest("li");
    const followUpId = li.dataset.id;

    if (button.dataset.action === "edit-followup") {
      const newAnswer = prompt("Enter your answer:");
      if (newAnswer !== null) {
        try {
          await fetchApi(`/questions/${followUpId}`, "PUT", { answer: newAnswer });
          await loadFollowUps(followUpId);
        } catch (error) {
          console.error("Error editing follow-up:", error.message);
        }
      }
    }
  });

  // Initial Load
  loadQuestions();
});
