// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'reminder_c';

export const getAll = async () => {
  try {
    const params = {
      fields: [
        {
          field: {
            Name: "Name"
          }
        },
        {
          field: {
            Name: "task_c_id_c"
          }
        },
        {
          field: {
            Name: "reminder_time_c"
          }
        },
        {
          field: {
            Name: "status_c"
          }
        }
      ],
      orderBy: [
        {
          fieldName: "reminder_time_c",
          sorttype: "ASC"
        }
      ]
    };

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching reminders:", error?.response?.data?.message);
    } else {
      console.error("Error in reminder service getAll:", error);
    }
    throw error;
  }
};

export const getByTaskId = async (taskId) => {
  try {
    const params = {
      fields: [
        {
          field: {
            Name: "Name"
          }
        },
        {
          field: {
            Name: "task_c_id_c"
          }
        },
        {
          field: {
            Name: "reminder_time_c"
          }
        },
        {
          field: {
            Name: "status_c"
          }
        }
      ],
      where: [
        {
          FieldName: "task_c_id_c",
          Operator: "EqualTo",
          Values: [parseInt(taskId)]
        }
      ],
      orderBy: [
        {
          fieldName: "reminder_time_c",
          sorttype: "ASC"
        }
      ]
    };

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching reminders for task ${taskId}:`, error?.response?.data?.message);
    } else {
      console.error("Error in reminder service getByTaskId:", error);
    }
    throw error;
  }
};

export const create = async (reminderData) => {
  try {
    const params = {
      records: [
        {
          Name: reminderData.name || `Reminder for ${reminderData.taskTitle}`,
          task_c_id_c: parseInt(reminderData.taskId),
          reminder_time_c: reminderData.reminderTime,
          status_c: "Scheduled"
        }
      ]
    };

    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} reminder records:${JSON.stringify(failedRecords)}`);
        throw new Error("Failed to create reminder");
      }
      
      return successfulRecords[0]?.data;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating reminder:", error?.response?.data?.message);
    } else {
      console.error("Error in reminder service create:", error);
    }
    throw error;
  }
};

export const update = async (id, updates) => {
  try {
    const params = {
      records: [
        {
          Id: parseInt(id),
          reminder_time_c: updates.reminderTime,
          status_c: updates.status
        }
      ]
    };

    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} reminder records:${JSON.stringify(failedUpdates)}`);
        throw new Error("Failed to update reminder");
      }
      
      return successfulUpdates[0]?.data;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating reminder:", error?.response?.data?.message);
    } else {
      console.error("Error in reminder service update:", error);
    }
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} reminder records:${JSON.stringify(failedDeletions)}`);
        throw new Error("Failed to delete reminder");
      }
      
      return true;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting reminder:", error?.response?.data?.message);
    } else {
      console.error("Error in reminder service remove:", error);
    }
    throw error;
  }
};

export const getDueReminders = async () => {
  try {
    const now = new Date().toISOString();
    
    const params = {
      fields: [
        {
          field: {
            Name: "Name"
          }
        },
        {
          field: {
            Name: "task_c_id_c"
          }
        },
        {
          field: {
            Name: "reminder_time_c"
          }
        },
        {
          field: {
            Name: "status_c"
          }
        }
      ],
      where: [
        {
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: ["Scheduled"]
        },
        {
          FieldName: "reminder_time_c",
          Operator: "LessThanOrEqualTo",
          Values: [now]
        }
      ]
    };

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching due reminders:", error?.response?.data?.message);
    } else {
      console.error("Error in reminder service getDueReminders:", error);
    }
    throw error;
  }
};