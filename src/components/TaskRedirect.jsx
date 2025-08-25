import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TaskRedirect = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (taskId) {
      navigate(`/annotation/${taskId}`, { replace: true });
    }
  }, [taskId, navigate]);

  return null; // This component does not render anything
};

export default TaskRedirect;
