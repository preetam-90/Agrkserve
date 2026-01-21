import { notificationService } from './notification-service';
import type { NotificationEventType } from '@/lib/types/notifications';
import { NOTIFICATION_TEMPLATES } from './config';

// =====================================================
// BOOKING NOTIFICATION HELPERS
// =====================================================
export async function notifyNewBookingRequest(params: {
  ownerId: string;
  renterName: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
  startDate: string;
  endDate: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.new'];

  return notificationService.createNotification({
    user_id: params.ownerId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/bookings/${params.bookingId}`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      renterName: params.renterName,
      equipmentName: params.equipmentName,
      startDate: params.startDate,
      endDate: params.endDate,
    },
    title: '',
    message: '',
  });
}

export async function notifyBookingAccepted(params: {
  renterId: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
  startDate: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.accepted'];

  return notificationService.createNotification({
    user_id: params.renterId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/bookings/${params.bookingId}`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
      startDate: params.startDate,
    },
    title: '',
    message: '',
  });
}

export async function notifyBookingRejected(params: {
  renterId: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.rejected'];

  return notificationService.createNotification({
    user_id: params.renterId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/equipment`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
    },
    title: '',
    message: '',
  });
}

export async function notifyBookingCancelled(params: {
  userId: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
  cancelledBy: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.cancelled'];

  return notificationService.createNotification({
    user_id: params.userId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/bookings/${params.bookingId}`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
      cancelledBy: params.cancelledBy,
    },
    title: '',
    message: '',
  });
}

export async function notifyBookingStartReminder(params: {
  renterId: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
  timeUntil: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.start_reminder'];

  return notificationService.createNotification({
    user_id: params.renterId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/bookings/${params.bookingId}`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
      timeUntil: params.timeUntil,
    },
    title: '',
    message: '',
  });
}

export async function notifyBookingEndReminder(params: {
  renterId: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
  timeUntil: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.end_reminder'];

  return notificationService.createNotification({
    user_id: params.renterId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/bookings/${params.bookingId}`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
      timeUntil: params.timeUntil,
    },
    title: '',
    message: '',
  });
}

export async function notifyBookingOverdue(params: {
  ownerId: string;
  renterId: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['booking.overdue'];

  // Notify both owner and renter
  await Promise.all([
    notificationService.createNotification({
      user_id: params.ownerId,
      category: template.category,
      event_type: template.event_type,
      priority: template.priority,
      action_url: `/dashboard/bookings/${params.bookingId}`,
      action_label: template.action_label,
      related_booking_id: params.bookingId,
      related_equipment_id: params.equipmentId,
      context: { equipmentName: params.equipmentName },
      title: '',
      message: '',
    }),
    notificationService.createNotification({
      user_id: params.renterId,
      category: template.category,
      event_type: template.event_type,
      priority: template.priority,
      action_url: `/dashboard/bookings/${params.bookingId}`,
      action_label: template.action_label,
      related_booking_id: params.bookingId,
      related_equipment_id: params.equipmentId,
      context: { equipmentName: params.equipmentName },
      title: '',
      message: '',
    }),
  ]);
}

// =====================================================
// PAYMENT NOTIFICATION HELPERS
// =====================================================
export async function notifyPaymentDue(params: {
  userId: string;
  amount: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['payment.due'];

  return notificationService.createNotification({
    user_id: params.userId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/bookings/${params.bookingId}/payment`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      amount: params.amount,
      equipmentName: params.equipmentName,
    },
    title: '',
    message: '',
  });
}

export async function notifyPaymentReceived(params: {
  ownerId: string;
  amount: string;
  equipmentName: string;
  equipmentId: string;
  bookingId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['payment.received'];

  return notificationService.createNotification({
    user_id: params.ownerId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/earnings`,
    action_label: template.action_label,
    related_booking_id: params.bookingId,
    related_equipment_id: params.equipmentId,
    context: {
      amount: params.amount,
      equipmentName: params.equipmentName,
    },
    title: '',
    message: '',
  });
}

// =====================================================
// MESSAGE NOTIFICATION HELPERS
// =====================================================
export async function notifyNewMessage(params: {
  recipientId: string;
  senderName: string;
  senderId: string;
  conversationId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['message.new'];

  return notificationService.createNotification({
    user_id: params.recipientId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/messages/${params.conversationId}`,
    action_label: template.action_label,
    related_user_id: params.senderId,
    context: {
      senderName: params.senderName,
    },
    title: '',
    message: '',
  });
}

export async function notifyEquipmentInquiry(params: {
  ownerId: string;
  senderName: string;
  senderId: string;
  equipmentName: string;
  equipmentId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['message.inquiry'];

  return notificationService.createNotification({
    user_id: params.ownerId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/messages`,
    action_label: template.action_label,
    related_equipment_id: params.equipmentId,
    related_user_id: params.senderId,
    context: {
      senderName: params.senderName,
      equipmentName: params.equipmentName,
    },
    title: '',
    message: '',
  });
}

// =====================================================
// REVIEW NOTIFICATION HELPERS
// =====================================================
export async function notifyNewReview(params: {
  ownerId: string;
  reviewerName: string;
  reviewerId: string;
  equipmentName: string;
  equipmentId: string;
  rating: number;
}) {
  const template = NOTIFICATION_TEMPLATES['review.new'];

  return notificationService.createNotification({
    user_id: params.ownerId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/equipment/${params.equipmentId}#reviews`,
    action_label: template.action_label,
    related_equipment_id: params.equipmentId,
    related_user_id: params.reviewerId,
    context: {
      reviewerName: params.reviewerName,
      equipmentName: params.equipmentName,
      rating: params.rating,
    },
    title: '',
    message: '',
  });
}

// =====================================================
// SECURITY NOTIFICATION HELPERS
// =====================================================
export async function notifyNewLogin(params: {
  userId: string;
  location: string;
  device: string;
}) {
  const template = NOTIFICATION_TEMPLATES['security.new_login'];

  return notificationService.createNotification({
    user_id: params.userId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard/settings/security`,
    action_label: template.action_label,
    context: {
      location: params.location,
      device: params.device,
    },
    title: '',
    message: '',
  });
}

// =====================================================
// INSIGHT NOTIFICATION HELPERS
// =====================================================
export async function notifyViewsMilestone(params: {
  ownerId: string;
  equipmentName: string;
  equipmentId: string;
  viewCount: number;
}) {
  const template = NOTIFICATION_TEMPLATES['insight.views_milestone'];

  return notificationService.createNotification({
    user_id: params.ownerId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/equipment/${params.equipmentId}/analytics`,
    action_label: template.action_label,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
      viewCount: params.viewCount,
    },
    title: '',
    message: '',
  });
}

export async function notifyHighDemand(params: {
  ownerId: string;
  equipmentName: string;
  equipmentId: string;
}) {
  const template = NOTIFICATION_TEMPLATES['insight.demand_high'];

  return notificationService.createNotification({
    user_id: params.ownerId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/equipment/${params.equipmentId}/edit`,
    action_label: template.action_label,
    related_equipment_id: params.equipmentId,
    context: {
      equipmentName: params.equipmentName,
    },
    title: '',
    message: '',
  });
}

// =====================================================
// SYSTEM NOTIFICATION HELPERS
// =====================================================
export async function notifyWelcome(userId: string) {
  const template = NOTIFICATION_TEMPLATES['system.welcome'];

  return notificationService.createNotification({
    user_id: userId,
    category: template.category,
    event_type: template.event_type,
    priority: template.priority,
    action_url: `/dashboard`,
    action_label: template.action_label,
    title: '',
    message: '',
    context: {},
  });
}
