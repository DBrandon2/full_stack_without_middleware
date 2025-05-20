import { BASE_URL } from "../utils/url";

export async function signin(values) {
  try {
    const response = await fetch(`${BASE_URL}/user/login`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });
    const userConnected = await response.json();
    return userConnected;
  } catch (error) {
    console.log(error);
  }
}

export async function signup(values) {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
    });
    const message = await response.json();
    return message;
  } catch (error) {
    console.log(error);
  }
}

export async function update(values) {
  const user = {
    _id: values._id,
    username: values.username,
    email: values.email,
  };
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      method: "PUT",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json",
      },
    });
    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function updateAvatar(values) {
  console.log(values);
  try {
    const response = await fetch(`${BASE_URL}/user/avatar`, {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
    });
    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${BASE_URL}/user/current`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function signOut() {
  await fetch(`${BASE_URL}/user/deleteToken`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function forgotPassword(values) {
  console.log(values);
  try {
    const response = await fetch(`${BASE_URL}/user/forgot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function resetPassword(values) {
  console.log(values);
  try {
    const response = await fetch(`${BASE_URL}/user/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function changePassword(values) {
  try {
    const response = await fetch(`${BASE_URL}/user/change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
