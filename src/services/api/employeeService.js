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

const employeeService = {
  async getAll() {
    try {
      const client = await getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "employee_code_c"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "department_id_c"}},
          {"field": {"Name": "join_date_c"}},
          {"field": {"Name": "salary_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await client.fetchRecords('employees_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching employees:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const client = await getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "employee_code_c"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "department_id_c"}},
          {"field": {"Name": "join_date_c"}},
          {"field": {"Name": "salary_c"}},
          {"field": {"Name": "email_c"}}
        ]
      };

      const response = await client.getRecordById('employees_c', id, params);
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(employeeData) {
    try {
      const client = await getApperClient();
      const params = {
        records: [{
          Name: employeeData.Name || `${employeeData.first_name_c} ${employeeData.last_name_c}`,
          employee_code_c: employeeData.employee_code_c,
          first_name_c: employeeData.first_name_c,
          last_name_c: employeeData.last_name_c,
          department_id_c: parseInt(employeeData.department_id_c),
          join_date_c: employeeData.join_date_c,
          salary_c: parseFloat(employeeData.salary_c),
          email_c: employeeData.email_c
        }]
      };

      const response = await client.createRecord('employees_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} employees:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Employee created successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating employee:", error?.response?.data?.message || error);
      toast.error("Failed to create employee");
      return null;
    }
  },

  async update(id, employeeData) {
    try {
      const client = await getApperClient();
      const params = {
        records: [{
          Id: id,
          Name: employeeData.Name || `${employeeData.first_name_c} ${employeeData.last_name_c}`,
          employee_code_c: employeeData.employee_code_c,
          first_name_c: employeeData.first_name_c,
          last_name_c: employeeData.last_name_c,
          department_id_c: parseInt(employeeData.department_id_c),
          join_date_c: employeeData.join_date_c,
          salary_c: parseFloat(employeeData.salary_c),
          email_c: employeeData.email_c
        }]
      };

      const response = await client.updateRecord('employees_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} employees:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Employee updated successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating employee:", error?.response?.data?.message || error);
      toast.error("Failed to update employee");
      return null;
    }
  },

  async delete(id) {
    try {
      const client = await getApperClient();
      const params = { RecordIds: [id] };

      const response = await client.deleteRecord('employees_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} employees:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Employee deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting employee:", error?.response?.data?.message || error);
      toast.error("Failed to delete employee");
      return false;
    }
  }
};

export default employeeService;