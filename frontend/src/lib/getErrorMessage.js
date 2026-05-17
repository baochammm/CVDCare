export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request) return "Network error. Please check your connection.";
  return "Something went wrong. Please try again.";
};
