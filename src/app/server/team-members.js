import { useState, useEffect, useCallback } from 'react'
import { sendRequest } from '@/utils/APIs'

// Fetch all team members
export const useGetTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true)
      try {
        const response = await sendRequest('/admin/team-members', 'GET')
        setTeamMembers(response)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  return { teamMembers, loading, error }
}

// Fetch single team member by ID
export const useGetTeamMember = (id) => {
  const [teamMember, setTeamMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchTeamMember = async () => {
      setLoading(true)
      try {
        const response = await sendRequest(`/admin/team-members/${id}`, 'GET')
        setTeamMember(response)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMember()
  }, [id])

  return { teamMember, loading, error }
}

// Add a new team member
export const useAddTeamMember = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addTeamMember = useCallback(async (newMember) => {
    setLoading(true)
    try {
      const response = await sendRequest('/admin/create-team-member', 'POST', newMember)

      return response
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { addTeamMember, loading, error }
}

// Update an existing team member
export const useUpdateTeamMember = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateTeamMember = useCallback(async ({ id, updatedData }) => {
    setLoading(true)
    try {
      const response = await sendRequest(`/admin/team-members/${id}`, 'PUT', updatedData)
      return response
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateTeamMember, loading, error }
}

// Delete a team member by ID
export const useDeleteTeamMember = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteTeamMember = useCallback(async (id) => {
    setLoading(true)
    try {
      const response = await sendRequest(`/admin/team-members/${id}`, 'DELETE')
      return response
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteTeamMember, loading, error }
}
