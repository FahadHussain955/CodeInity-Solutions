import { useEffect, useMemo, useState } from 'react';
import defaultAvatar from '@/assets/default-avatar.svg';
import { resolveMediaUrl } from '@/utils/mediaUrl';

/**
 * Shared user avatar with a professional default when no photo exists or load fails.
 * Parent controls outer size/shape via className (e.g. w-8 h-8 rounded-full).
 */
const UserAvatar = ({
  user,
  src,
  alt = 'User profile',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  fallbackClassName = '',
}) => {
  const [failed, setFailed] = useState(false);

  const photoUrl = useMemo(() => {
    const raw =
      src ||
      user?.avatar ||
      user?.profilePicture ||
      user?.profilePhoto ||
      user?.photoUrl ||
      '';
    return resolveMediaUrl(raw);
  }, [src, user]);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const showImage = Boolean(photoUrl) && !failed;

  return (
    <div
      className={`overflow-hidden bg-primary-container flex items-center justify-center shrink-0 ${className}`}
    >
      {showImage ? (
        <img
          src={photoUrl}
          alt={alt}
          className={imgClassName}
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={defaultAvatar}
          alt=""
          aria-hidden="true"
          className={`w-full h-full object-cover ${fallbackClassName}`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
