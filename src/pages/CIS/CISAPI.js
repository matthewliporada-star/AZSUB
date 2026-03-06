// CISAPI.js
export const fetchCountries = async () => {
  const response = await fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/countries", {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch countries");

  const data = await response.json();
  // Return as array of { name, code }
  return data.data.map((c) => ({ name: c.name, code: c.code }));
};

export const fetchCities = async (countryCode) => {
  const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryCode}/regions`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch cities");

  const data = await response.json();
  // Return as array of { name, postalCode: "" } (GeoDB doesn't return postal code, you'll need another API for that)
  return data.data.map((c) => ({ name: c.name, postalCode: "" }));
};