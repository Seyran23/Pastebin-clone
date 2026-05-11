import { getFileFromS3 } from '@/modules/cloud/service';

interface WithAvatar {
  avatar?: string | null;
}

const attachAvatarImage = async (
  user: WithAvatar,
  target: Record<string, unknown>,
): Promise<void> => {
  if (!user.avatar) return;

  const imageData = await getFileFromS3(user.avatar);
  target.avatar = `data:${imageData.contentType};base64,${imageData.buffer.toString('base64')}`;
};

export default attachAvatarImage;
