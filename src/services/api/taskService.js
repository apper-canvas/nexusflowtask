// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'task_c';

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
            Name: "title_c"
          }
        },
        {
          field: {
            Name: "due_date_c"
          }
        },
        {
          field: {
            Name: "priority_c"
          }
        },
        {
          field: {
            Name: "status_c"
          }
        },
        {
          field: {
            Name: "created_at_c"
          }
        },
        {
          field: {
            Name: "category_id_c"
          }
        }
      ],
      orderBy: [
        {
          fieldName: "created_at_c",
          sorttype: "DESC"
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
      console.error("Error fetching tasks:", error?.response?.data?.message);
    } else {
      console.error("Error in task service getAll:", error);
    }
    throw error;
  }
};

export const getById = async (id) => {
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
            Name: "title_c"
          }
        },
        {
          field: {
            Name: "due_date_c"
          }
        },
        {
          field: {
            Name: "priority_c"
          }
        },
        {
          field: {
            Name: "status_c"
          }
        },
        {
          field: {
            Name: "created_at_c"
          }
        },
        {
          field: {
            Name: "category_id_c"
          }
        }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error("Error in task service getById:", error);
    }
    throw error;
  }
};

export const create = async (taskData) => {
  try {
    const params = {
      records: [
        {
          Name: taskData.title,
          title_c: taskData.title,
          due_date_c: taskData.dueDate,
          priority_c: taskData.priority,
          status_c: "To Do",
          created_at_c: new Date().toISOString(),
          category_id_c: taskData.categoryId ? parseInt(taskData.categoryId) : null
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
        console.error(`Failed to create ${failedRecords.length} task records:${JSON.stringify(failedRecords)}`);
        throw new Error("Failed to create task");
      }
      
      return successfulRecords[0]?.data;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating task:", error?.response?.data?.message);
    } else {
      console.error("Error in task service create:", error);
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
          Name: updates.title,
          title_c: updates.title,
          due_date_c: updates.dueDate,
          priority_c: updates.priority,
          status_c: updates.status,
          category_id_c: updates.categoryId ? parseInt(updates.categoryId) : null
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
        console.error(`Failed to update ${failedUpdates.length} task records:${JSON.stringify(failedUpdates)}`);
        throw new Error("Failed to update task");
      }
      
      return successfulUpdates[0]?.data;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating task:", error?.response?.data?.message);
    } else {
      console.error("Error in task service update:", error);
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
        console.error(`Failed to delete ${failedDeletions.length} task records:${JSON.stringify(failedDeletions)}`);
        throw new Error("Failed to delete task");
      }
      
      return true;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting task:", error?.response?.data?.message);
    } else {
      console.error("Error in task service remove:", error);
    }
    throw error;
  }
};