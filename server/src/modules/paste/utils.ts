import { sequelize } from '@/db/models';
import type { Paste } from '@/db/models/paste';
import type { User } from '@/db/models/user';
import { AppError } from '@/middlewares/error-handler';
import { getFileFromS3 } from '@/modules/cloud/service';

import { PasteDto } from './dto';

export const formatPasteContent = async (
  paste: Paste,
): Promise<{ content: string; contentType: string }> => {
  const fileContent = await getFileFromS3(paste.cloud_name);

  let formattedContent: string;
  if (fileContent.isImage) {
    formattedContent = `data:${fileContent.contentType};base64,${fileContent.buffer.toString('base64')}`;
  } else if (fileContent.contentType.startsWith('text/')) {
    formattedContent = fileContent.textContent ?? '';
  } else {
    throw new AppError(422, 'Unsupported file type');
  }

  return { content: formattedContent, contentType: fileContent.contentType };
};

export interface PasteResponseOwner {
  id: string;
  username: string;
  avatar: string | null;
}

export interface PasteResponse {
  pasteData: PasteDto & { content: string; contentType: string };
  owner: PasteResponseOwner | null;
  remainingTime: number | null;
}

export const formatPasteResponse = (
  paste: Paste & { user?: User | null },
  fileData: { content: string; contentType: string },
  remainingTime: number | null,
): PasteResponse => {
  const owner = paste.user
    ? { id: paste.user.id, username: paste.user.username, avatar: paste.user.avatar }
    : null;

  return {
    pasteData: { ...new PasteDto(paste), ...fileData },
    owner,
    remainingTime,
  };
};

export const formatPasteSummaries = (pastes: Paste[]): PasteDto[] => {
  return pastes.map((paste) => new PasteDto(paste));
};

export const calculateRemainingTime = (expirationTime: number | null): number | null => {
  return expirationTime ? expirationTime - Date.now() : null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildOrder = (sort: string): any[] => {
  const orderMap: Record<string, unknown[]> = {
    newest: [['createdAt', 'DESC']],
    oldest: [['createdAt', 'ASC']],
    likes: [
      [
        sequelize.literal(
          '(SELECT COUNT(*) FROM like_stats WHERE paste_id = "Paste".id AND is_liked = true)',
        ),
        'DESC',
      ],
    ],
  };
  return orderMap[sort] ?? orderMap.newest;
};

export const parseTimeFilter = (time: string): Date | null => {
  const timeMap: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };
  if (!timeMap[time]) return null;
  const date = new Date();
  date.setDate(date.getDate() - timeMap[time]);
  return date;
};
