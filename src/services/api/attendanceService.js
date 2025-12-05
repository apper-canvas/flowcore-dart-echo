import { toast } from "react-toastify";

let apperClient = null;

const getApperClient = async () => {
  if (apperClient) return apperClient;
  
  if (!window.ApperSDK) {
    throw new Error("ApperSDK not loaded");
  }

  const { ApperClient } = window.ApperSDK;
  apperClient = new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });

  return apperClient;
};

const attendanceService = {
  async getAll() {
    try {
      const client = await getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "employee_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };

      const response = await client.fetchRecords('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const client = await getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "employee_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };

      const response = await client.getRecordById('attendance_c', id, params);
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching attendance ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(attendanceData) {
    try {
      const client = await getApperClient();
      const params = {
        records: [{
          Name: attendanceData.Name || `Attendance - ${attendanceData.date_c}`,
          employee_id_c: parseInt(attendanceData.employee_id_c),
          date_c: attendanceData.date_c,
          status_c: attendanceData.status_c,
          notes_c: attendanceData.notes_c || ""
        }]
      };

      const response = await client.createRecord('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} attendance records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Attendance record created successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating attendance:", error?.response?.data?.message || error);
      toast.error("Failed to create attendance record");
      return null;
    }
  },

  async update(id, attendanceData) {
    try {
      const client = await getApperClient();
      const params = {
        records: [{
          Id: id,
          Name: attendanceData.Name || `Attendance - ${attendanceData.date_c}`,
          employee_id_c: parseInt(attendanceData.employee_id_c),
          date_c: attendanceData.date_c,
          status_c: attendanceData.status_c,
          notes_c: attendanceData.notes_c || ""
        }]
      };

      const response = await client.updateRecord('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} attendance records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Attendance record updated successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating attendance:", error?.response?.data?.message || error);
      toast.error("Failed to update attendance record");
      return null;
    }
  },

  async delete(id) {
    try {
      const client = await getApperClient();
      const params = { RecordIds: [id] };

      const response = await client.deleteRecord('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} attendance records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Attendance record deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting attendance:", error?.response?.data?.message || error);
      toast.error("Failed to delete attendance record");
      return false;
    }
  }
};

export default attendanceService;