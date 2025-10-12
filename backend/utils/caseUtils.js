/**
 * Generate a human-readable case ID
 * Format: CAS-YYYY-XXXX (where XXXX is last 4 chars of MongoDB _id)
 * @param {string} mongoId - MongoDB ObjectId string
 * @returns {string} - Readable case ID like CAS-2025-4B89
 */
const generateReadableCaseId = (mongoId) => {
  const currentYear = new Date().getFullYear();
  const lastFourChars = mongoId.slice(-4).toUpperCase();
  return `CAS-${currentYear}-${lastFourChars}`;
};

/**
 * Generate next available hearing date and time for a judge
 * Prevents scheduling conflicts and distributes hearings across working days
 * @param {string} judgeId - Judge's MongoDB ObjectId
 * @param {Object} Case - Case model
 * @returns {Date} - Next available hearing date and time
 */
const generateNextHearingDate = async (judgeId, Case) => {
  try {
    // Get all cases assigned to this judge with upcoming hearings
    const existingCases = await Case.find({ 
      assignedJudge: judgeId,
      next_hearing: { $exists: true, $ne: null }
    }).select('next_hearing').sort({ next_hearing: 1 });

    // Define working hours (10 AM to 4 PM) and slot duration (1 hour)
    const WORK_START_HOUR = 10;
    const WORK_END_HOUR = 16;
    const SLOT_DURATION_HOURS = 1;
    const SLOTS_PER_DAY = (WORK_END_HOUR - WORK_START_HOUR) / SLOT_DURATION_HOURS; // 6 slots

    // Get existing hearing times for this judge
    const existingHearings = existingCases.map(c => c.next_hearing).filter(Boolean);
    
    // Start from tomorrow (next working day)
    let candidateDate = new Date();
    candidateDate.setDate(candidateDate.getDate() + 1);
    candidateDate.setHours(WORK_START_HOUR, 0, 0, 0); // Start at 10:00 AM

    // Find next available slot
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loop

    while (attempts < maxAttempts) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (candidateDate.getDay() === 0 || candidateDate.getDay() === 6) {
        candidateDate.setDate(candidateDate.getDate() + 1);
        candidateDate.setHours(WORK_START_HOUR, 0, 0, 0);
        attempts++;
        continue;
      }

      // Check all time slots for this day
      for (let slot = 0; slot < SLOTS_PER_DAY; slot++) {
        const slotTime = new Date(candidateDate);
        slotTime.setHours(WORK_START_HOUR + slot, 0, 0, 0);
        
        // Add small random offset (+/- 10-20 minutes) for realism
        const randomOffset = Math.floor(Math.random() * 21) - 10; // -10 to +10 minutes
        slotTime.setMinutes(slotTime.getMinutes() + randomOffset);

        // Check if this slot conflicts with existing hearings
        const hasConflict = existingHearings.some(existingHearing => {
          if (!existingHearing) return false;
          const timeDiff = Math.abs(slotTime.getTime() - existingHearing.getTime());
          return timeDiff < (60 * 60 * 1000); // Less than 1 hour apart
        });

        if (!hasConflict) {
          console.log(`📅 Scheduled hearing for ${slotTime.toISOString()} (Judge: ${judgeId})`);
          return slotTime;
        }
      }

      // No slots available today, try next day
      candidateDate.setDate(candidateDate.getDate() + 1);
      candidateDate.setHours(WORK_START_HOUR, 0, 0, 0);
      attempts++;
    }

    // Fallback: if no slot found, schedule 14 days from now at 11 AM
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 14);
    fallbackDate.setHours(11, 0, 0, 0);
    
    console.log(`⚠️ Using fallback hearing date: ${fallbackDate.toISOString()}`);
    return fallbackDate;

  } catch (error) {
    console.error('Error generating next hearing date:', error);
    // Fallback to 14 days from now at 11 AM
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 14);
    fallbackDate.setHours(11, 0, 0, 0);
    return fallbackDate;
  }
};

module.exports = {
  generateReadableCaseId,
  generateNextHearingDate
};
