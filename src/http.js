export async function fetchData(url) {
  const response = await fetch(url);
  const resData = await response.json();
  if (!response.ok) {
    throw new Error();
  }

  return resData;
}

export async function updateUserPlaces(url, places) {
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({places}),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error("Failed To Update User Data");
  }

  return resData.message;
}
