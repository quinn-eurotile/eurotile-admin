'use server'

import { retailCustomerService } from '@/services/retail-customer';
// Data Imports

import RetailCustomerList from '@/views/admin/retail-customers/list';


export async function fetchList(currentPage = 1, rowsPerPage = 10, searchTerm = '', filteredData = null) {
  try {
    return await retailCustomerService.get(currentPage, rowsPerPage, searchTerm, filteredData);
  } catch (error) {
    console.error('Failed to fetch retail customer list', error);
  }
};


export async function updateStatus(id, subPath, data) {
  try {
    return await retailCustomerService.patch(id, subPath, data);
  } catch (error) {
    console.error('Error updating Status:', error);
    return { success: false };
  }
}

export async function deleteRecord(id) {
  try {
    return await retailCustomerService.delete(id);
  } catch (error) {
    console.error('Error deleting retail customer:', error);
    return { success: false };
  }
}

const RetailCustomers = async () => {

  return <RetailCustomerList fetchList={fetchList} deleteRecord={deleteRecord} updateStatus={updateStatus} />
}

export default RetailCustomers
