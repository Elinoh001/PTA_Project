import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // ton backend Django

export const getActivities = async () => {
  return axios.get(`${API_URL}/activites/`);
};

export const createActivity = async (data) => {
  return axios.post(`${API_URL}/activites/`, data);
};

export const updateActivity = async (id, data) => {
  return axios.put(`${API_URL}/activites/${id}/`, data);
};

export const deleteActivity = async (id) => {
  return axios.delete(`${API_URL}/activites/${id}/`);
};

