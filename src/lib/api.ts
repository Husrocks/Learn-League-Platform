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

/**
 * Shared response handler — extracts FastAPI's `detail` field from error
 * responses so the UI always shows the real reason (e.g. "Email already
 * registered") instead of a hardcoded generic message.
 */
async function handleResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        if (typeof body.detail === "string") {
          detail = body.detail;
        } else if (Array.isArray(body.detail)) {
          // Handle FastAPI 422 Validation Errors gracefully
          detail = body.detail
            .map((err: any) => {
              const field = err.loc ? err.loc[err.loc.length - 1] : "Field";
              return `${field}: ${err.msg}`;
            })
            .join(", ");
        } else {
          detail = JSON.stringify(body.detail);
        }
      } else if (body?.message) {
        detail = body.message;
      }
    } catch {
      // Response body was not JSON — keep the default message
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// --- Auth Endpoints ---

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res); // { access_token, token_type, user }
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
  return handleResponse(res);
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateProfile(data: {
  name?: string;
  learning_goal?: string;
}) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// --- Tasks Endpoints ---

export async function assignTask(
  userId: number | string,
  taskData: { title: string; assigned_by: string }
) {
  const res = await fetch(`${API_URL}/tasks/${userId}/assign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  });
  return handleResponse(res);
}

export async function completeTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function reviewTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/review`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function rejectTask(taskId: number | string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/reject`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// --- Social Endpoints ---

export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/social/leaderboard`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getFriends(userId: number | string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function addFriend(userId: number | string, friendEmail: string) {
  const res = await fetch(`${API_URL}/social/friends/${userId}/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ friend_email: friendEmail }),
  });
  return handleResponse(res);
}

export async function removeFriend(
  userId: number | string,
  friendId: number | string
) {
  const res = await fetch(
    `${API_URL}/social/friends/${userId}/remove/${friendId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );
  return handleResponse(res);
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
  return handleResponse(res);
}

// --- AI Test Endpoints ---

export type MCQOption = {
  id: string; // "A", "B", "C", "D"
  text: string;
};

export type MCQQuestion = {
  id: number;
  topic: string;
  question: string;
  options: MCQOption[];
  correct_option: string;
  explanation: string;
};

export type QuizResponse = {
  topics_covered: string;
  assigned_topics: string[];
  questions: MCQQuestion[];
  question?: string;
  model_used?: string;
};

export async function generateInterviewQuestion(
  userId: number | string,
  customTopic?: string,
  count: number = 3
): Promise<QuizResponse> {
  const query = new URLSearchParams();
  if (customTopic) query.set("custom_topic", customTopic);
  if (count) query.set("count", String(count));
  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await fetch(`${API_URL}/test/${userId}/generate${queryString}`, {
    headers: authHeaders(),
  });
  return handleResponse<QuizResponse>(res);
}

export async function evaluateMCQAnswer(
  userId: number | string,
  payload: {
    question_id?: number;
    topic?: string;
    question: string;
    selected_option: string;
    correct_option: string;
    explanation?: string;
    user_reasoning?: string;
  }
) {
  const res = await fetch(`${API_URL}/test/${userId}/evaluate-mcq`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function evaluateAnswer(
  userId: number | string,
  question: string,
  answer: string
) {
  const res = await fetch(`${API_URL}/test/${userId}/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question, answer }),
  });
  return handleResponse(res);
}

// --- Winner Endpoint ---

export async function getWeeklyWinner() {
  const res = await fetch(`${API_URL}/winner/current`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}
