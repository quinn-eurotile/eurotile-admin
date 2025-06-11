const adminRole = { id: '680f110aa6224872fab09569', name: 'Admin', slug: 'admin' };
const teamMemberRole = { id: '680f606cb47c317ad30841b5', name: 'Team Member', slug: 'team-member' };
const tradeProfessionalRole = { id: '6819ce06bb8f30e6c73eba48', name: 'Trade Professional', slug: 'trade-professional' };

const adminSettingId = `683eaa785fabaae3a4c5de04`;

// Order Status Constants
const orderStatus = {
    CANCELLED: 0,
    DELIVERED: 1,
    PROCESSING: 2,
    NEW: 3,
    SHIPPED: 4,
    PENDING: 5
};

const orderStatusObj = {
    [orderStatus.NEW]: { label: 'New', color: 'primary' },
    [orderStatus.PENDING]: { label: 'Pending', color: 'warning' },
    [orderStatus.PROCESSING]: { label: 'Processing', color: 'info' },
    [orderStatus.SHIPPED]: { label: 'Shipped', color: 'secondary' },
    [orderStatus.DELIVERED]: { label: 'Delivered', color: 'success' },
    [orderStatus.CANCELLED]: { label: 'Cancelled', color: 'error' }
};

// Customer Types
const customerTypes = {
    RETAIL: 'retail',
    TRADE: 'trade'
};

const customerTypeObj = {
    [customerTypes.RETAIL]: { label: 'Retail', color: 'primary' },
    [customerTypes.TRADE]: { label: 'Trade', color: 'secondary' }
};

// Payment Status
const paymentStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded'
};

const paymentStatusObj = {
    [paymentStatus.PENDING]: { label: 'Pending', color: 'warning' },
    [paymentStatus.PAID]: { label: 'Paid', color: 'success' },
    [paymentStatus.FAILED]: { label: 'Failed', color: 'error' },
    [paymentStatus.REFUNDED]: { label: 'Refunded', color: 'info' },
    [paymentStatus.PARTIALLY_REFUNDED]: { label: 'Partially Refunded', color: 'secondary' }
};

// Shipping Methods
const shippingMethods = {
    STANDARD: 'standard',
    EXPRESS: 'express',
    NEXT_DAY: 'next_day'
};

const shippingMethodsObj = {
    [shippingMethods.STANDARD]: { label: 'Standard Shipping', price: 0 },
    [shippingMethods.EXPRESS]: { label: 'Express Shipping', price: 15 },
    [shippingMethods.NEXT_DAY]: { label: 'Next Day Delivery', price: 25 }
};

// Order History Action Types
const orderHistoryActions = {
    CREATED: 'created',
    UPDATED: 'updated',
    STATUS_CHANGED: 'status_changed',
    EMAIL_SENT: 'email_sent',
    NOTE_ADDED: 'note_added',
    TRACKING_UPDATED: 'tracking_updated'
};

const orderHistoryActionObj = {
    [orderHistoryActions.CREATED]: { label: 'Created', icon: 'ri-add-circle-line', color: 'success' },
    [orderHistoryActions.UPDATED]: { label: 'Updated', icon: 'ri-edit-line', color: 'info' },
    [orderHistoryActions.STATUS_CHANGED]: { label: 'Status Changed', icon: 'ri-truck-line', color: 'warning' },
    [orderHistoryActions.EMAIL_SENT]: { label: 'Email Sent', icon: 'ri-mail-send-line', color: 'primary' },
    [orderHistoryActions.NOTE_ADDED]: { label: 'Note Added', icon: 'ri-sticky-note-line', color: 'secondary' },
    [orderHistoryActions.TRACKING_UPDATED]: { label: 'Tracking Updated', icon: 'ri-route-line', color: 'info' }
};

// Table Pagination Default Values
const defaultPagination = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
};

export {
    adminRole,
    teamMemberRole,
    tradeProfessionalRole,
    adminSettingId,
    orderStatus,
    orderStatusObj,
    customerTypes,
    customerTypeObj,
    paymentStatus,
    paymentStatusObj,
    shippingMethods,
    shippingMethodsObj,
    orderHistoryActions,
    orderHistoryActionObj,
    defaultPagination
};
