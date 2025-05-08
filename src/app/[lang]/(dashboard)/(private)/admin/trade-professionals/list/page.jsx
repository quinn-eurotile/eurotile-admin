'use server'

// Server Component (no 'use client' directive needed)
import { Suspense } from 'react';
import CircularLoader from '@/components/common/CircularLoader';
import TradeProfessionalsList from '@/views/admin/trade-professionals/list';
import { getTradeProfessionals } from '@/app/server/trade-professionals';
import { teamMemberService } from '@/services/team-member';

// Server-side data fetching
export async function getTeamMembersData(page = 1, rowsPerPage = 10, search = '', filters = null) {

  try {
    const response = await getTradeProfessionals(page, rowsPerPage, search, filters);
    if (response.success && response.data) {
      const formatted = response.data.docs.map(member => ({
        id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: 'maintainer',
        status: member.status,
        avatar: '',
        username: member.email.split('@')[0]
      }));

      // Count status totals
      const totalDocs = response?.data?.totalDocs || 0;
      const totalActive = response?.data?.statusSummary?.active || 0;
      const totalPending = response?.data?.statusSummary?.pending || 0;
      const totalInactive = response?.data?.statusSummary?.inactive || 0;

      const getTrend = (count) => {
        const percentage = totalDocs ? ((count / totalDocs) * 100).toFixed(2) : 0;
        return {
          trendNumber: `${percentage}%`,
          trend: percentage >= 50 ? 'positive' : 'negative'
        };
      };

      const statsData = [
        {
          title: 'All Users',
          stats: totalDocs.toString(),
          avatarIcon: 'ri-user-add-line',
          avatarColor: 'error',
          trend: 'neutral',
          trendNumber: '100%',
        },
        {
          title: 'Active Users',
          stats: totalActive.toString(),
          avatarIcon: 'ri-user-follow-line',
          avatarColor: 'success',
          ...getTrend(totalActive),
        },
        {
          title: 'Pending Users',
          stats: totalPending.toString(),
          avatarIcon: 'ri-user-search-line',
          avatarColor: 'warning',
          ...getTrend(totalPending),
        },
        {
          title: 'Inactive Users',
          stats: totalInactive.toString(),
          avatarIcon: 'ri-user-search-line',
          avatarColor: 'secondary',
          ...getTrend(totalInactive),
        }
      ];

      return {
        members: formatted,
        totalRecords: response.data.totalDocs || 0,
        statsData,
        page: page - 1 // Adjust for zero-based indexing in client
      };
    }

    return { members: [], totalRecords: 0, statsData: [], page: 0 };
  } catch (error) {
    console.error('Failed to fetch team members', error);
    return { members: [], totalRecords: 0, statsData: [], page: 0 };
  }
}

// Server actions for data mutations
export async function updateTeamMemberStatus(id, newStatus) {
  // 'use server';
  try {
    return await teamMemberService.updateStatus(id, newStatus);
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false };
  }
}

export async function deleteTeamMember(id) {
  // 'use server';
  try {
    return await teamMemberService.deleteTeamMember(id);
  } catch (error) {
    console.error('Error deleting team member:', error);
    return { success: false };
  }
}

export default async function TradeProfessionalsPage() {


  // Initial data fetch on the server
  const initialData = await getTeamMembersData();


  return (
    <Suspense fallback={<CircularLoader />}>
      <TradeProfessionalsList
        initialData={initialData}
        updateTeamMemberStatus={updateTeamMemberStatus}
        deleteTeamMember={deleteTeamMember}
        getTeamMembersData={getTeamMembersData}

      />
    </Suspense>
  );
}
