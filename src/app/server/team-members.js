
import { api2 } from '@/utils/api2';
import { useSession } from 'next-auth/react';


export const getTeamMembers = async () => {
  const { sendRequest } = api2();
  try {
    const response = await sendRequest('/admin/team-members', 'GET')
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Fetch a single team member by ID
 * @param teamMemberId - ID of the team member
 */
export const getTeamMemberById = async (teamMemberId) => {
  const { sendRequest } = useApiRequest();
  try {
    const response = await sendRequest(`/admin/team-members/${teamMemberId}`, 'GET')
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Add a new team member
 * @param newTeamMemberData - Object containing team member details
 */
export const addTeamMember = async (newTeamMemberData) => {
  const { sendRequest } = useApiRequest();
  try {
    const response = await sendRequest('/admin/create-team-member', 'POST', newTeamMemberData)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Update an existing team member
 * @param teamMemberId - ID of the team member
 * @param updatedTeamMemberData - Object containing updated fields
 */
export const updateTeamMember = async (teamMemberId, updatedTeamMemberData) => {
  const { sendRequest } = useApiRequest();
  try {
    const response = await sendRequest(`/admin/team-members/${teamMemberId}`, 'PUT', updatedTeamMemberData)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Delete a team member by ID
 * @param teamMemberId - ID of the team member
 */
export const deleteTeamMember = async (teamMemberId) => {
  const { sendRequest } = useApiRequest();
  try {
    const response = await sendRequest(`/admin/team-members/${teamMemberId}`, 'DELETE')
    return response
  } catch (error) {
    throw error
  }
}
