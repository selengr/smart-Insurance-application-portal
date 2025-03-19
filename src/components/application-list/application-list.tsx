"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://assignment.devotel.io";

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/insurance/forms/submissions`);
        setApplications(response.data.data);
        setColumns(response.data.columns);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div>
      <h2>Submitted Applications</h2>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app:any) => (
            <tr key={app.id}>
              {columns.map((column) => (
                <td key={column}>{app[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationList;