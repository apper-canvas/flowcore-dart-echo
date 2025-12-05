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

const payrollService = {
  async getAll() {
    try {
      const client = await getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "employee_id_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "gross_salary_c"}},
          {"field": {"Name": "deductions_c"}},
          {"field": {"Name": "net_salary_c"}},
          {"field": {"Name": "payment_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "month_c", "sorttype": "DESC"}]
      };

      const response = await client.fetchRecords('payroll_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching payroll:", error?.response?.data?.message || error);
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
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "gross_salary_c"}},
          {"field": {"Name": "deductions_c"}},
          {"field": {"Name": "net_salary_c"}},
          {"field": {"Name": "payment_date_c"}}
        ]
      };

      const response = await client.getRecordById('payroll_c', id, params);
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching payroll ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(payrollData) {
    try {
      const client = await getApperClient();
      const params = {
        records: [{
          Name: payrollData.Name || `Payroll - ${payrollData.month_c}`,
          employee_id_c: parseInt(payrollData.employee_id_c),
          month_c: payrollData.month_c,
          gross_salary_c: parseFloat(payrollData.gross_salary_c),
          deductions_c: parseFloat(payrollData.deductions_c || 0),
          net_salary_c: parseFloat(payrollData.net_salary_c),
          payment_date_c: payrollData.payment_date_c
        }]
      };

      const response = await client.createRecord('payroll_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} payroll records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Payroll record created successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating payroll:", error?.response?.data?.message || error);
      toast.error("Failed to create payroll record");
      return null;
    }
  },

  async update(id, payrollData) {
    try {
      const client = await getApperClient();
      const params = {
        records: [{
          Id: id,
          Name: payrollData.Name || `Payroll - ${payrollData.month_c}`,
          employee_id_c: parseInt(payrollData.employee_id_c),
          month_c: payrollData.month_c,
          gross_salary_c: parseFloat(payrollData.gross_salary_c),
          deductions_c: parseFloat(payrollData.deductions_c || 0),
          net_salary_c: parseFloat(payrollData.net_salary_c),
          payment_date_c: payrollData.payment_date_c
        }]
      };

      const response = await client.updateRecord('payroll_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} payroll records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Payroll record updated successfully");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating payroll:", error?.response?.data?.message || error);
      toast.error("Failed to update payroll record");
      return null;
    }
  },

  async delete(id) {
    try {
      const client = await getApperClient();
      const params = { RecordIds: [id] };

      const response = await client.deleteRecord('payroll_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} payroll records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Payroll record deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting payroll:", error?.response?.data?.message || error);
      toast.error("Failed to delete payroll record");
      return false;
    }
  }
};

export default payrollService;