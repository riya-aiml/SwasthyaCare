import NotificationJob from './notificationJob.model.js';

/**
 * Notification Service & Delivery Adapters (Sprint 5: S5-08, S5-09, S5-10)
 * Provides provider boundaries, sanitized message formatting, idempotency, and retry worker.
 */

// Simulated provider adapters for reliable development/testing
export const emailAdapter = {
  async send({ to, subject, message }) {
    // In production, integrate SendGrid/AWS SES/Postmark
    console.log(`📧 [EMAIL ADAPTER] To: ${to} | Subject: "${subject}"`);
    console.log(`   Message: ${message}`);
    // Simulate successful provider delivery
    return { provider: 'email-mock', messageId: `msg_${Date.now()}`, status: 'delivered' };
  },
};

export const smsAdapter = {
  async send({ to, message }) {
    // In production, integrate Twilio/AWS SNS
    console.log(`📱 [SMS ADAPTER] To: ${to} | Message: ${message}`);
    return { provider: 'sms-mock', messageId: `sms_${Date.now()}`, status: 'delivered' };
  },
};

/**
 * Schedule reminder jobs for a follow-up plan
 * Automatically queues reminders for scheduled check-in days with deduplication keys
 */
export const schedulePlanReminders = async (plan, patient) => {
  const jobs = [];
  const dischargeDate = new Date(plan.dischargeDate || Date.now());

  for (const day of plan.reminderCadenceDays || [1, 3, 7, 14]) {
    const scheduledFor = new Date(dischargeDate);
    scheduledFor.setDate(scheduledFor.getDate() + day);

    // Sanitized notification copy (protects sensitive medical diagnosis)
    const subject = `SwasthyaCare: Day ${day} Recovery Check-in`;
    const message = `Hello ${patient.firstName}, this is your automated SwasthyaCare recovery reminder. Please take a moment to submit your Day ${day} health update so your care team can monitor your progress.`;
    const deduplicationKey = `plan_${plan._id}_day_${day}_email`;

    try {
      const job = await NotificationJob.findOneAndUpdate(
        { deduplicationKey },
        {
          $setOnInsert: {
            deduplicationKey,
            recipient: patient._id,
            channel: 'email',
            recipientAddress: patient.email,
            type: 'RECOVERY_CHECKIN_PROMPT',
            subject,
            message,
            metadata: { planId: plan._id, dayNumber: day },
            scheduledFor,
            status: 'PENDING',
            attempts: 0,
            maxRetries: 3,
          },
        },
        { upsert: true, new: true }
      );
      jobs.push(job);
    } catch (err) {
      console.warn(`Duplicate or failed job creation for key ${deduplicationKey}:`, err.message);
    }
  }

  return jobs;
};

/**
 * Worker: Process due notification jobs
 * Pulls jobs where status = PENDING and scheduledFor <= now
 * Includes retry logic with exponential backoff and error logging
 */
export const processDueNotifications = async () => {
  const now = new Date();

  // Find due jobs
  const dueJobs = await NotificationJob.find({
    status: { $in: ['PENDING', 'FAILED'] },
    scheduledFor: { $lte: now },
    attempts: { $lt: 3 }, // Only retry if attempts < maxRetries
  }).limit(20);

  const results = { processed: 0, sent: 0, failed: 0 };

  for (const job of dueJobs) {
    results.processed++;
    job.status = 'PROCESSING';
    job.attempts += 1;
    job.lastAttemptAt = new Date();
    await job.save();

    try {
      let deliveryResult;
      if (job.channel === 'email') {
        deliveryResult = await emailAdapter.send({
          to: job.recipientAddress,
          subject: job.subject,
          message: job.message,
        });
      } else if (job.channel === 'sms') {
        deliveryResult = await smsAdapter.send({
          to: job.recipientAddress,
          message: job.message,
        });
      }

      job.status = 'SENT';
      job.sentAt = new Date();
      job.deliveryLogs.push({
        attempt: job.attempts,
        success: true,
        providerResponse: JSON.stringify(deliveryResult),
      });
      await job.save();
      results.sent++;
    } catch (error) {
      console.error(`Notification job ${job._id} delivery failed on attempt ${job.attempts}:`, error);
      job.status = job.attempts >= job.maxRetries ? 'FAILED' : 'PENDING';
      job.failureReason = error.message;
      // Exponential backoff: retry in 5 * 2^attempts minutes
      const backoffMinutes = 5 * Math.pow(2, job.attempts);
      job.scheduledFor = new Date(Date.now() + backoffMinutes * 60000);
      job.deliveryLogs.push({
        attempt: job.attempts,
        success: false,
        error: error.message,
      });
      await job.save();
      results.failed++;
    }
  }

  return results;
};
