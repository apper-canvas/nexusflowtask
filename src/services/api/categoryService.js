// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'category_c';

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
            Name: "color_c"
          }
        },
        {
          field: {
            Name: "created_at_c"
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
      console.error("Error fetching categories:", error?.response?.data?.message);
    } else {
      console.error("Error in category service getAll:", error);
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
            Name: "color_c"
          }
        },
        {
          field: {
            Name: "created_at_c"
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
      console.error(`Error fetching category with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error("Error in category service getById:", error);
    }
    throw error;
  }
};

export const create = async (categoryData) => {
  try {
    const params = {
      records: [
        {
          Name: categoryData.name,
          color_c: categoryData.color,
          created_at_c: new Date().toISOString()
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
        console.error(`Failed to create ${failedRecords.length} category records:${JSON.stringify(failedRecords)}`);
        throw new Error("Failed to create category");
      }
      
      return successfulRecords[0]?.data;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating category:", error?.response?.data?.message);
    } else {
      console.error("Error in category service create:", error);
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
          Name: updates.name,
          color_c: updates.color
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
        console.error(`Failed to update ${failedUpdates.length} category records:${JSON.stringify(failedUpdates)}`);
        throw new Error("Failed to update category");
      }
      
      return successfulUpdates[0]?.data;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating category:", error?.response?.data?.message);
    } else {
      console.error("Error in category service update:", error);
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
        console.error(`Failed to delete ${failedDeletions.length} category records:${JSON.stringify(failedDeletions)}`);
        throw new Error("Failed to delete category");
      }
      
      return true;
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting category:", error?.response?.data?.message);
    } else {
      console.error("Error in category service remove:", error);
    }
    throw error;
  }
};