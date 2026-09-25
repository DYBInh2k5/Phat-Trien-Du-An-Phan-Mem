// Generic stub factory: logs the call, waits 500ms, then resolves with success
const createStub = (name) => async (payload) => {
  console.log(`[API STUB] ${name}`, payload);
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, data: payload }), 500)
  );
};

// handleLoginSubmit has special reject logic for error-path testing
export const handleLoginSubmit = async ({ username, password, role }) => {
  console.log('[API STUB] handleLoginSubmit', { username, role });
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (username === 'error') {
        reject(new Error('Invalid credentials'));
      } else {
        resolve({ success: true, user: { username, role } });
      }
    }, 500)
  );
};

export const handleSaveGrades       = createStub('handleSaveGrades');
export const handleSaveAttendance   = createStub('handleSaveAttendance');
export const handleSendNotification = createStub('handleSendNotification');
export const handleSaveScheduleSlot = createStub('handleSaveScheduleSlot');
export const handleExportReport     = createStub('handleExportReport');
export const handleCreateUser       = createStub('handleCreateUser');
export const handleUpdateUser       = createStub('handleUpdateUser');
export const handleDeactivateUser   = createStub('handleDeactivateUser');

export const handleApproveGradeBook  = createStub('handleApproveGradeBook');
export const handleLockAllGradeBooks = createStub('handleLockAllGradeBooks');
