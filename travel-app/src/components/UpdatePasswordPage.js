import React, { useState } from 'react';
import ResetPasswordModal from './ResetPasswordModal';

const UpdatePasswordPage = () => {
  const [showResetPassword, setShowResetPassword] = useState(false);

  return React.createElement(
    'div',
    null,
    React.createElement(ResetPasswordModal, {
      showResetPassword: showResetPassword,
      setShowResetPassword: setShowResetPassword
    })
  );
};

export default UpdatePasswordPage;