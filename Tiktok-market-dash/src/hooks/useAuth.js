import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout } from '@/features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(setCredentials(credentials));
  const logoutUser = () => dispatch(logout());

  return { user, isAuthenticated, token, login, logout: logoutUser };
};
