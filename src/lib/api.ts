const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Auth Endpoints ---

export async function login(email: string, password?: string) {
  // Using POST with query params for simplicity as defined in router
  const res = await fetch(`${API_URL}/auth/login?email=${encodeURIComponent(email)}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to login");
  return res.json();
}

export async function register(userData: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Failed to register");
  return res.json();
}

export async function getMe(userId: number | string) {
  const res = await fetch(`${API_URL}/auth/me/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// --- Tasks Endpoints ---

export async function assignTask(userId: number | string, taskData: any) {
  const res = await fetch(`${API_URL}/tasks/${userId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error("Failed to assign task");
  return res.json();
}

export async function completeTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/complete`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to complete task");
  return res.json();
}

export async function reviewTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/review`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to review task");
  return res.json();
}

// --- Social Endpoints ---

export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/social/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function getFriends(userId: number | string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json();
}

export async function addFriend(userId: number | string, friendEmail: string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ friend_email: friendEmail })
  });
  if (!res.ok) throw new Error("Failed to add friend");
  return res.json();
}

export async function removeFriend(userId: number | string, friendId: number | string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}/remove/${friendId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to remove friend");
  return res.json();
}

// --- Gamification Endpoints ---

export async function logDailyLearning(userId: number | string, hours_studied: number, topics: string, reflection: string, tasks: any[]) {
  const res = await fetch(`${API_URL}/learning/${userId}/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ hours_studied, topics, reflection, tasks })
  });
  if (!res.ok) throw new Error("Failed to log learning");
  return res.json();
}

// --- AI Test Endpoints ---

export async function generateInterviewQuestion(userId: number | string) {
  const res = await fetch(`${API_URL}/test/${userId}/generate`);
  if (!res.ok) throw new Error("Failed to generate question");
  return res.json();
}

export async function evaluateAnswer(userId: number | string, question: string, answer: string) {
  const res = await fetch(`${API_URL}/test/${userId}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question, answer })
  });
  if (!res.ok) throw new Error("Failed to evaluate answer");
  return res.json();
}
