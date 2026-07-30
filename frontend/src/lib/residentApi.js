import axiosInstance from "./axiosInstance";

export const uploadResidentsExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post(
    "/api/residents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getResidents = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/api/residents?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const createResident = async (data) => {
  const response = await axiosInstance.post("/api/residents", data);
  return response.data;
};

export const updateResident = async (id, data) => {
  const response = await axiosInstance.put(`/api/residents/${id}`, data);
  return response.data;
};

export const deleteResident = async (id) => {
  const response = await axiosInstance.delete(`/api/residents/${id}`);
  return response.data;
};