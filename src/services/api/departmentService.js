import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class DepartmentService {
  constructor() {
    this.tableName = 'departments_c';
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}}, 
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "department_code_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_number_c"}},
          {"field": {"Name": "manager_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to fetch departments:`, response);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching departments:', error?.response?.data?.message || error);
      toast.error('Failed to load departments');
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}}, 
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "department_code_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_number_c"}},
          {"field": {"Name": "manager_id_c"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(`Failed to fetch department with Id: ${id}:`, response);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching department ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(departmentData) {
    try {
      const apperClient = getApperClient();
      
// Filter out empty values and only include updateable fields
      const cleanData = {};
      const updateableFields = ['Name', 'Tags', 'description_c', 'department_code_c', 'location_c', 'email_c', 'phone_number_c', 'manager_id_c'];
      
      updateableFields.forEach(field => {
        if (departmentData[field] !== undefined && departmentData[field] !== null && departmentData[field] !== '') {
          if (field === 'manager_id_c') {
            cleanData[field] = parseInt(departmentData[field]);
          } else {
            cleanData[field] = departmentData[field];
          }
        }
      });

      const params = {
        records: [cleanData]
      };

      const response = await apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to create department:`, response);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} departments:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Department created successfully');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating department:', error?.response?.data?.message || error);
      toast.error('Failed to create department');
      return null;
    }
  }

  async update(id, departmentData) {
    try {
      const apperClient = getApperClient();
      
      // Filter out empty values and only include updateable fields
const cleanData = { Id: parseInt(id) };
      const updateableFields = ['Name', 'Tags', 'description_c', 'department_code_c', 'location_c', 'email_c', 'phone_number_c', 'manager_id_c'];
      
      updateableFields.forEach(field => {
        if (departmentData[field] !== undefined && departmentData[field] !== null && departmentData[field] !== '') {
          if (field === 'manager_id_c') {
            cleanData[field] = parseInt(departmentData[field]);
          } else {
            cleanData[field] = departmentData[field];
          }
        }
      });
      const params = {
        records: [cleanData]
      };

      const response = await apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to update department:`, response);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} departments:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Department updated successfully');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating department:', error?.response?.data?.message || error);
      toast.error('Failed to update department');
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to delete department:`, response);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} departments:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Department deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting department:', error?.response?.data?.message || error);
      toast.error('Failed to delete department');
      return false;
    }
  }
}

export default new DepartmentService();