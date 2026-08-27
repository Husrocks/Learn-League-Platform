const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ll_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// --- Auth Endpoints ---

export async function login(email: string, password: string) {
  const res = await fetch(
    `${API_URL}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Incorrect email or password");
  return res.json(); // { access_token, token_type, user }
}

export async function register(userData: {
  name: string;
  username: string;
  email: string;
  password: string;
  learning_goal: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to register");
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// --- Tasks Endpoints ---

export async function assignTask(userId: number | string, taskData: { title: string; assigned_by: string }) {
  const res = await fetch(`${API_URL}/tasks/${userId}/assign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error("Failed to assign task");
  return res.json();
}

export async function completeTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to complete task");
  return res.json();
}

export async function reviewTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/review`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to review task");
  return res.json();
}

// --- Social Endpoints ---

export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/social/leaderboard`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function getFriends(userId: number | string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json();
}

export async function addFriend(userId: number | string, friendEmail: string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ friend_email: friendEmail }),
  });
  if (!res.ok) throw new Error("Failed to add friend");
  return res.json();
}

export async function removeFriend(userId: number | string, friendId: number | string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}/remove/${friendId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove friend");
  return res.json();
}

// --- Gamification Endpoints ---

export async function logDailyLearning(
  userId: number | string,
  hours_studied: number,
  topics: string,
  reflection: string,
  tasks: { title: string; status: string }[]
) {
  const res = await fetch(`${API_URL}/learning/${userId}/log`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ hours_studied, topics, reflection, tasks }),
  });
  if (!res.ok) throw new Error("Failed to log learning");
  return res.json();
}

// --- AI Test Endpoints ---

export async function generateInterviewQuestion(userId: number | string) {
  const res = await fetch(`${API_URL}/test/${userId}/generate`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to generate question");
  return res.json();
}

export async function evaluateAnswer(userId: number | string, question: string, answer: string) {
  const res = await fetch(`${API_URL}/test/${userId}/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question, answer }),
  });
  if (!res.ok) throw new Error("Failed to evaluate answer");
  return res.json();
}
