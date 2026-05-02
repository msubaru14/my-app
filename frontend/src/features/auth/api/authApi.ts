import { requestJson, API_BASE_URL, getAuthHeaders } from "../../../lib/api";

// POST /users
export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  console.log('create user');
  const json = await requestJson(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password
    }),
  });

  return json.data.user;
};

// POST /login
export const login = async (
  email: string,
  password: string
) => {
  const json = await requestJson(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return json.data;
};

// GET /me
export const getMe = async () => {
  console.log('get me');
  const json = await requestJson(`${API_BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });

  return json.data.user;
}
