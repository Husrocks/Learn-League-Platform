import type { User, Friend, Task } from "../store/useStore";
import {
  AuthResponseSchema,
  UserSchema,
  validateRuntimeSchema,
} from "./schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://learn-league-backend.vercel.app";

export const AUTH_EXPIRED_EVENT = "learnleague:auth-expired";

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type AdminTask = Task & {
  name: string;
  username: string;
};

export type EvaluationResult = {
  is_correct: boolean;
  score: number;
  xp_earned: number;
  feedback: string;
  explanation: string;
};

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
 * Safe fetch wrapper that catches raw browser network failures (e.g. CORS preflight issues, offline mode, server connection refused)
 * and formats them into clean, predictable Error exceptions.
 */
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
      throw new Error("Unable to connect to backend server. Please verify network connection or try again later.");
    }
    throw err;
  }
}

/**
 * Shared response handler — extracts FastAPI's `detail` field from error
 * responses so the UI always shows the real reason (e.g. "Email already
 * registered") instead of a hardcoded generic message.
 */
async function handleResponse<T = unknown>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ll_token");
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    throw new Error("Session expired. Please log in again.");
  }

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
            .map((err: { loc?: (string | number)[]; msg: string; type: string }) => {
              const field = err.loc ? String(err.loc[err.loc.length - 1]) : "Field";
              
              // Custom friendly messages for common fields
              if (err.type === "string_too_short") {
                if (field === "topics") return "Please add at least one topic you studied today.";
                if (field === "reflection") return "Please write a short reflection on what you learned.";
                
                const formattedField = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
                return `${formattedField} cannot be empty.`;
              }
              
              const formattedField = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
              return `${formattedField}: ${err.msg}`;
            })
            .join(" | ");
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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await safeFetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<AuthResponse>(res);
  return validateRuntimeSchema(AuthResponseSchema, data) as AuthResponse;
}

export async function register(userData: {
  name: string;
  username: string;
  email: string;
  password: string;
  learning_goal: string;
}): Promise<AuthResponse> {
  const res = await safeFetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await handleResponse<AuthResponse>(res);
  return validateRuntimeSchema(AuthResponseSchema, data) as AuthResponse;
}

export async function getMe(): Promise<User> {
  const res = await safeFetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  const data = await handleResponse<User>(res);
  return validateRuntimeSchema(UserSchema, data) as User;
}

export async function updateProfile(data: {
  name?: string;
  learning_goal?: string;
}): Promise<User> {
  const res = await safeFetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<User>(res);
}

// --- Tasks Endpoints ---

export async function assignTask(
  userId: number | string,
  taskData: { title: string; assigned_by: string }
): Promise<Task> {
  const res = await safeFetch(`${API_URL}/tasks/${userId}/assign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  });
  return handleResponse<Task>(res);
}

export async function completeTask(taskId: number | string): Promise<Task> {
  const res = await safeFetch(`${API_URL}/tasks/${taskId}/complete`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse<Task>(res);
}

export async function reviewTask(taskId: number | string): Promise<Task> {
  const res = await safeFetch(`${API_URL}/tasks/${taskId}/review`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse<Task>(res);
}

export async function rejectTask(taskId: number | string): Promise<Task> {
  const res = await safeFetch(`${API_URL}/tasks/${taskId}/reject`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse<Task>(res);
}

// --- Social Endpoints ---

export async function getLeaderboard(): Promise<User[]> {
  const res = await safeFetch(`${API_URL}/social/leaderboard`, {
    headers: authHeaders(),
  });
  return handleResponse<User[]>(res);
}

export async function getFriends(userId: number | string): Promise<Friend[]> {
  const res = await safeFetch(`${API_URL}/social/friends/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse<Friend[]>(res);
}

export async function addFriend(userId: number | string, friendEmail: string): Promise<{ message: string }> {
  const res = await safeFetch(`${API_URL}/social/friends/${userId}/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ friend_email: friendEmail }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function removeFriend(
  userId: number | string,
  friendId: number | string
): Promise<{ message: string }> {
  const res = await safeFetch(
    `${API_URL}/social/friends/${userId}/remove/${friendId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );
  return handleResponse<{ message: string }>(res);
}

// --- Gamification Endpoints ---

export async function logDailyLearning(
  userId: number | string,
  hours_studied: number,
  topics: string,
  reflection: string,
  tasks: { title: string; status: string }[] = [],
  task_ids?: number[]
): Promise<{ message: string; xp_earned?: number }> {
  const res = await safeFetch(`${API_URL}/learning/${userId}/log`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ hours_studied, topics, reflection, tasks, task_ids }),
  });
  return handleResponse<{ message: string; xp_earned?: number }>(res);
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
  const res = await safeFetch(`${API_URL}/test/${userId}/generate${queryString}`, {
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
): Promise<EvaluationResult> {
  const res = await safeFetch(`${API_URL}/test/${userId}/evaluate-mcq`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<EvaluationResult>(res);
}

export async function evaluateAnswer(
  userId: number | string,
  question: string,
  answer: string
): Promise<EvaluationResult> {
  const res = await safeFetch(`${API_URL}/test/${userId}/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question, answer }),
  });
  return handleResponse<EvaluationResult>(res);
}

// --- Winner Endpoint ---

export type WeeklyWinner = {
  week_start: string;
  winner_name: string;
  total_xp: number;
  tasks_completed: number;
};

export async function getWeeklyWinner(): Promise<WeeklyWinner> {
  const res = await safeFetch(`${API_URL}/winner/current`, {
    headers: authHeaders(),
  });
  return handleResponse<WeeklyWinner>(res);
}

// --- Admin Endpoints ---

export async function getAdminUsers(): Promise<User[]> {
  const res = await safeFetch(`${API_URL}/admin/users`, {
    headers: authHeaders(),
  });
  return handleResponse<User[]>(res);
}

export async function getAdminTasks(): Promise<AdminTask[]> {
  const res = await safeFetch(`${API_URL}/admin/tasks`, {
    headers: authHeaders(),
  });
  return handleResponse<AdminTask[]>(res);
}

export async function updateUserRole(userId: number | string, role: string): Promise<{ message: string }> {
  const res = await safeFetch(`${API_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse<{ message: string }>(res);
}
