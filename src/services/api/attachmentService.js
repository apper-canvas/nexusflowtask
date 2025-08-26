import { toast } from "react-toastify";

// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
});

const tableName = "attachment_c";

// Get all attachments for a specific task
export async function getByTaskId(taskId) {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "task_c_id_c" } },
        { field: { Name: "file_name_c" } },
        { field: { Name: "file_type_c" } },
        { field: { Name: "file_path_c" } },
        { field: { Name: "upload_date_c" } },
        { field: { Name: "file_size_c" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } }
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
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ]
    };

    const response = await apperClient.fetchRecords(tableName, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching attachments:", error?.response?.data?.message);
    } else {
      console.error(error);
    }
    return [];
  }
}

// Upload new attachment
export async function upload(attachmentData) {
  try {
    const params = {
      records: [
        {
          // Only include updateable fields
          Name: attachmentData.name,
          Tags: attachmentData.tags || "",
          task_c_id_c: parseInt(attachmentData.taskId),
          file_name_c: attachmentData.fileName,
          file_type_c: attachmentData.fileType,
          file_path_c: attachmentData.filePath,
          upload_date_c: new Date().toISOString(),
          file_size_c: attachmentData.fileSize
        }
      ]
    };

    const response = await apperClient.createRecord(tableName, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);

      if (failedRecords.length > 0) {
        console.error(`Failed to create attachment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) toast.error(record.message);
        });
      }

      if (successfulRecords.length > 0) {
        toast.success("Attachment uploaded successfully!");
        return successfulRecords[0].data;
      }
    }

    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error uploading attachment:", error?.response?.data?.message);
    } else {
      console.error(error);
    }
    return null;
  }
}

// Delete attachment
export async function remove(attachmentId) {
  try {
    const params = {
      RecordIds: [parseInt(attachmentId)]
    };

    const response = await apperClient.deleteRecord(tableName, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);

      if (failedDeletions.length > 0) {
        console.error(`Failed to delete attachment ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }

      if (successfulDeletions.length > 0) {
        toast.success("Attachment deleted successfully!");
        return true;
      }
    }

    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting attachment:", error?.response?.data?.message);
    } else {
      console.error(error);
    }
    return false;
  }
}

// Get all attachments
export async function getAll() {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "task_c_id_c" } },
        { field: { Name: "file_name_c" } },
        { field: { Name: "file_type_c" } },
        { field: { Name: "file_path_c" } },
        { field: { Name: "upload_date_c" } },
        { field: { Name: "file_size_c" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 50,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords(tableName, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching all attachments:", error?.response?.data?.message);
    } else {
      console.error(error);
    }
    return [];
  }
}